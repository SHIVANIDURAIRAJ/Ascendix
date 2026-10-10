import os
import pymongo
from dotenv import load_dotenv

load_dotenv()

_client = None
_db = None

def get_db():
    """
    Returns a singleton PyMongo database instance for ascendix_db.
    """
    global _client, _db
    if _db is not None:
        return _db

    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/ascendix_db")
    
    try:
        _client = pymongo.MongoClient(
            mongodb_uri,
            serverSelectionTimeoutMS=5000
        )
        # Parse db name from URI or default to ascendix_db
        db_name = "ascendix_db"
        if "/" in mongodb_uri.split("?")[0]:
            parts = mongodb_uri.split("?")[0].split("/")
            if parts[-1]:
                db_name = parts[-1]
                
        _db = _client[db_name]
        
        # Ensure indexes for Phase 1 & 2
        _db.student_profiles.create_index([("user_id", pymongo.ASCENDING)], unique=True)
        _db.resumes.create_index([("user_id", pymongo.ASCENDING)])
        _db.target_roles.create_index([("role_id", pymongo.ASCENDING)], unique=True)
        _db.role_requirements.create_index([("role_id", pymongo.ASCENDING)], unique=True)
        _db.company_opportunities.create_index([("company_id", pymongo.ASCENDING)], unique=True)
        _db.student_company_eligibility.create_index([("user_id", pymongo.ASCENDING), ("company_id", pymongo.ASCENDING)], unique=True)
        _db.notifications.create_index([("user_id", pymongo.ASCENDING), ("created_at", pymongo.DESCENDING)])

        print(f"[Django DB] Connected to MongoDB database '{db_name}' with verified indexes.")

        # Seed roles and benchmark requirements
        try:
            from core.seeds import seed_target_roles_and_requirements
            seed_target_roles_and_requirements()
        except Exception as se:
            print(f"[Django DB] Notice: Seed deferred: {se}")

        return _db
    except Exception as e:
        print(f"[Django DB] Warning: MongoDB connection error: {e}")
        raise e

def get_profiles_collection():
    return get_db()["student_profiles"]

def get_users_collection():
    return get_db()["users"]

def get_resumes_collection():
    return get_db()["resumes"]

def get_target_roles_collection():
    return get_db()["target_roles"]

def get_role_requirements_collection():
    return get_db()["role_requirements"]

def get_company_opportunities_collection():
    return get_db()["company_opportunities"]

def get_student_eligibility_collection():
    return get_db()["student_company_eligibility"]

def get_notifications_collection():
    return get_db()["notifications"]

