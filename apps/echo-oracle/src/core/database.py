import os
import sqlite3
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False

from src.core.config import POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB

class DataBase:
    def __init__(self):
        self.use_sqlite = False
        if not PSYCOPG2_AVAILABLE:
            self.use_sqlite = True
            db_path = os.path.join(os.path.dirname(__file__), "echoaverix.db")
            self.conn = sqlite3.connect(db_path, check_same_thread=False)
            self.conn.row_factory = sqlite3.Row
            self._create_sqlite_tables()
            print("Falling back to SQLite database (psycopg2 not available)...")
        else:
            try:
                self.conn = psycopg2.connect(
                    user=POSTGRES_USER,
                    password=POSTGRES_PASSWORD,
                    host=POSTGRES_HOST,
                    port=POSTGRES_PORT,
                    database=POSTGRES_DB
                )
                self.conn.autocommit = True
                print("Connected to PostgreSQL successfully.")
            except Exception as e:
                print(f"PostgreSQL connection failed ({e}). Falling back to SQLite database...")
                self.use_sqlite = True
                db_path = os.path.join(os.path.dirname(__file__), "echoaverix.db")
                self.conn = sqlite3.connect(db_path, check_same_thread=False)
                self.conn.row_factory = sqlite3.Row
                self._create_sqlite_tables()


    def _create_sqlite_tables(self):
        cursor = self.conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS echo_agents (
                id TEXT PRIMARY KEY,
                creator TEXT,
                metadata_uri TEXT,
                name TEXT,
                domain TEXT,
                description TEXT,
                system_prompt TEXT,
                base_model TEXT,
                active_version INTEGER DEFAULT 1,
                price_type TEXT,
                price_amount REAL,
                echo_score INTEGER DEFAULT 0
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS echo_scores (
                agent_id TEXT PRIMARY KEY,
                accuracy INTEGER,
                reliability INTEGER,
                safety INTEGER,
                consistency INTEGER,
                quality INTEGER,
                community INTEGER,
                composite INTEGER
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS knowledge_vaults (
                id TEXT PRIMARY KEY,
                agent_id TEXT,
                source_name TEXT,
                source_type TEXT,
                source_content TEXT
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS licenses (
                id TEXT PRIMARY KEY,
                agent_id TEXT,
                user_address TEXT,
                license_type TEXT,
                expiry_time INTEGER,
                active INTEGER DEFAULT 1
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS revenue_records (
                id TEXT PRIMARY KEY,
                agent_id TEXT,
                creator TEXT,
                amount REAL,
                timestamp INTEGER
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS mesh_sessions (
                id TEXT PRIMARY KEY,
                query TEXT,
                response TEXT,
                attribution TEXT,
                timestamp INTEGER
            )
        """)
        self.conn.commit()

    def get_cursor(self):
        if self.use_sqlite or not PSYCOPG2_AVAILABLE:
            return self.conn.cursor()
        else:
            return self.conn.cursor(cursor_factory=RealDictCursor)


    # Core Agent CRUD
    def insert_agent(self, id, creator, metadata_uri, name, domain, description, system_prompt, base_model, price_type, price_amount, echo_score=0):
        cursor = self.get_cursor()
        if self.use_sqlite:
            cursor.execute(
                "INSERT OR REPLACE INTO echo_agents (id, creator, metadata_uri, name, domain, description, system_prompt, base_model, price_type, price_amount, echo_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (id, creator, metadata_uri, name, domain, description, system_prompt, base_model, price_type, price_amount, echo_score)
            )
            self.conn.commit()
        else:
            cursor.execute(
                "INSERT INTO echo_agents (id, creator, metadata_uri, name, domain, description, system_prompt, base_model, price_type, price_amount, echo_score) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT (id) DO UPDATE SET creator=EXCLUDED.creator, metadata_uri=EXCLUDED.metadata_uri, name=EXCLUDED.name, domain=EXCLUDED.domain, description=EXCLUDED.description, system_prompt=EXCLUDED.system_prompt, base_model=EXCLUDED.base_model, price_type=EXCLUDED.price_type, price_amount=EXCLUDED.price_amount, echo_score=EXCLUDED.echo_score",
                (id, creator, metadata_uri, name, domain, description, system_prompt, base_model, price_type, price_amount, echo_score)
            )
        return id

    def get_agent(self, id):
        cursor = self.get_cursor()
        if self.use_sqlite:
            cursor.execute("SELECT * FROM echo_agents WHERE id = ?", (id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        else:
            cursor.execute("SELECT * FROM echo_agents WHERE id = %s", (id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def get_all_agents(self):
        cursor = self.get_cursor()
        if self.use_sqlite:
            cursor.execute("SELECT * FROM echo_agents")
            rows = cursor.fetchall()
            return [dict(r) for r in rows]
        else:
            cursor.execute("SELECT * FROM echo_agents")
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def delete_agent(self, id):
        cursor = self.get_cursor()
        if self.use_sqlite:
            cursor.execute("DELETE FROM echo_agents WHERE id = ?", (id,))
            self.conn.commit()
        else:
            cursor.execute("DELETE FROM echo_agents WHERE id = %s", (id,))

    # EchoScore DB Methods
    def insert_score(self, agent_id, accuracy, reliability, safety, consistency, quality, community, composite):
        cursor = self.get_cursor()
        if self.use_sqlite:
            cursor.execute(
                "INSERT OR REPLACE INTO echo_scores (agent_id, accuracy, reliability, safety, consistency, quality, community, composite) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (agent_id, accuracy, reliability, safety, consistency, quality, community, composite)
            )
            cursor.execute("UPDATE echo_agents SET echo_score = ? WHERE id = ?", (composite, agent_id))
            self.conn.commit()
        else:
            cursor.execute(
                "INSERT INTO echo_scores (agent_id, accuracy, reliability, safety, consistency, quality, community, composite) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT (agent_id) DO UPDATE SET accuracy=EXCLUDED.accuracy, reliability=EXCLUDED.reliability, safety=EXCLUDED.safety, consistency=EXCLUDED.consistency, quality=EXCLUDED.quality, community=EXCLUDED.community, composite=EXCLUDED.composite",
                (agent_id, accuracy, reliability, safety, consistency, quality, community, composite)
            )
            cursor.execute("UPDATE echo_agents SET echo_score = %s WHERE id = %s", (composite, agent_id))
        return agent_id

    def get_score(self, agent_id):
        cursor = self.get_cursor()
        if self.use_sqlite:
            cursor.execute("SELECT * FROM echo_scores WHERE agent_id = ?", (agent_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        else:
            cursor.execute("SELECT * FROM echo_scores WHERE agent_id = %s", (agent_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    # Knowledge Vault DB Methods
    def insert_knowledge(self, id, agent_id, source_name, source_type, source_content):
        cursor = self.get_cursor()
        if self.use_sqlite:
            cursor.execute(
                "INSERT OR REPLACE INTO knowledge_vaults (id, agent_id, source_name, source_type, source_content) VALUES (?, ?, ?, ?, ?)",
                (id, agent_id, source_name, source_type, source_content)
            )
            self.conn.commit()
        else:
            cursor.execute(
                "INSERT INTO knowledge_vaults (id, agent_id, source_name, source_type, source_content) VALUES (%s, %s, %s, %s, %s)",
                (id, agent_id, source_name, source_type, source_content)
            )
        return id

    def get_knowledge_by_agent(self, agent_id):
        cursor = self.get_cursor()
        if self.use_sqlite:
            cursor.execute("SELECT * FROM knowledge_vaults WHERE agent_id = ?", (agent_id,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]
        else:
            cursor.execute("SELECT * FROM knowledge_vaults WHERE agent_id = %s", (agent_id,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    # Licensing DB Methods
    def insert_license(self, id, agent_id, user_address, license_type, expiry_time):
        cursor = self.get_cursor()
        if self.use_sqlite:
            cursor.execute(
                "INSERT OR REPLACE INTO licenses (id, agent_id, user_address, license_type, expiry_time) VALUES (?, ?, ?, ?, ?)",
                (id, agent_id, user_address, license_type, expiry_time)
            )
            self.conn.commit()
        else:
            cursor.execute(
                "INSERT INTO licenses (id, agent_id, user_address, license_type, expiry_time) VALUES (%s, %s, %s, %s, %s)",
                (id, agent_id, user_address, license_type, expiry_time)
            )
        return id

    def get_license(self, user_address, agent_id):
        cursor = self.get_cursor()
        if self.use_sqlite:
            cursor.execute("SELECT * FROM licenses WHERE user_address = ? AND agent_id = ? AND active = 1", (user_address, agent_id))
            row = cursor.fetchone()
            return dict(row) if row else None
        else:
            cursor.execute("SELECT * FROM licenses WHERE user_address = %s AND agent_id = %s AND active = 1", (user_address, agent_id))
            row = cursor.fetchone()
            return dict(row) if row else None

    # Revenue Methods
    def insert_revenue(self, id, agent_id, creator, amount, timestamp):
        cursor = self.get_cursor()
        if self.use_sqlite:
            cursor.execute(
                "INSERT INTO revenue_records (id, agent_id, creator, amount, timestamp) VALUES (?, ?, ?, ?, ?)",
                (id, agent_id, creator, amount, timestamp)
            )
            self.conn.commit()
        else:
            cursor.execute(
                "INSERT INTO revenue_records (id, agent_id, creator, amount, timestamp) VALUES (%s, %s, %s, %s, %s)",
                (id, agent_id, creator, amount, timestamp)
            )
        return id

    def get_revenue_by_creator(self, creator):
        cursor = self.get_cursor()
        if self.use_sqlite:
            cursor.execute("SELECT * FROM revenue_records WHERE creator = ?", (creator,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]
        else:
            cursor.execute("SELECT * FROM revenue_records WHERE creator = %s", (creator,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

db = DataBase()
