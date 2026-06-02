from hmac import new
from shutil import ExecError
from uuid import UUID

from fastapi import FastAPI, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy import  Integer, true

from models import orders, users
from database import SessionLocal, engine
import database_models
from sqlalchemy import text
from util.cors import setup_cors
from util.auth import create_access_token, verify_access_token
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo
import os



app = FastAPI()
setup_cors(app)

database_models.Base.metadata.create_all(bind=engine)

# Stable UUIDs so user 1 / order 11 stay easy to spot (must match Postgres uuid columns).
_U1 = UUID("00000000-0000-0000-0000-000000000001")
_U2 = UUID("00000000-0000-0000-0000-000000000002")
_O11 = UUID("00000000-0000-0000-0000-00000000000b")  # 11
_O22 = UUID("00000000-0000-0000-0000-000000000016")  # 22

Users=[
    users(id=_U1,email="m21newyork@gmail.com",name="Moe Bayat",role="customer",hashed_pw="ABCX",is_active=True,created_at="2026-05-02T12:00:00"),
    users(id=_U2,email="mbny30k@gmail.com",name="Sima Alibeygi",role="customer",hashed_pw="ABFX",is_active=True,created_at="2026-05-01T12:00:00")
]

Orders =[
   orders(id=_O11,customer_id=_U1,status="pending",version="1",requested_time="2026-05-02T13:53:00",confirmed_time="2026-05-02T13:54:00",proposed_time="2026-05-02T14:00:00",proposal_expir="2026-05-02T15:00:00",reschedule_count=0,notes="",idempotency_key="",created_at="2026-05-02T13:52:00",updated_at="2026-05-02T13:54:30"),
   orders(id=_O22,customer_id=_U2,status="complete",version="1",requested_time="2026-05-02T13:54:00",confirmed_time="2026-05-02T13:55:00",proposed_time="2026-05-02T14:05:00",proposal_expir="2026-05-02T15:05:00",reschedule_count=0,notes="",idempotency_key="",created_at="2026-05-02T13:50:00",updated_at="2026-05-02T13:56:00")
]



class Bread_Order(BaseModel):
    order_quantiy: int
    bread_type: str
    order_time: datetime
    unit_price: Optional[int]=None
    
class User(BaseModel):
    user_id: Optional[UUID] = None
    first_name:str 
    last_name:str
    user_name:str 
    role:str
    hashpass:str
    address1: Optional[str] = None 
    city: Optional[str] = None 
    zipcode: Optional[str] = None 
 
class Customer(BaseModel):
    user_id: Optional[UUID] = None
    first_name:str 
    last_name:str
    phone_number: str
    address: str




class AdminLoginRequest(BaseModel):
    username: str
    password: str


class BakeryCapacityUpdate(BaseModel):
    maxLoaves: int = Field(ge=0, le=100_000)


def init_db():
    
    db=SessionLocal()
    user_table=database_models.users
    order_table=database_models.orders

    users_count = db.query(user_table).count
    orders_count = db.query(order_table).count

    if users_count == 0:
        for user in Users:
            db.add(database_models.users(** user.model_dump()))
        db.flush()  # persist users before orders so FK customer_id resolves
    if orders_count == 0:
        for order in Orders:
            db.add(database_models.orders(** order.model_dump()))
    db.commit()

init_db()


@app.get("/")
def get_all_products():
    db = SessionLocal()
    db.query()
    try:
        return {"status": "ok"}
    finally:
        db.close()



@app.post("/admin/registration")
def admin_registration(new_user:User):
    query='INSERT INTO users (first_name, last_name,user_name,hashed_pw,role,created_at) VALUES (:first_name,:last_name,:user_name,:hash_pass,:role,:created_at);'
    with engine.connect() as db_connection:
        db_statement=text(query)
        try:
            db_connection.execute(db_statement,{
                "first_name":new_user.first_name,
                "last_name":new_user.last_name, 
                "user_name":new_user.user_name,
                "hash_pass":new_user.hashpass,
                "role": "admin",
                "created_at":datetime.now()})
            db_connection.commit()
        except Exception:
            db_connection.rollback()
            raise
    return ({"Message":"Admin Registered Successfully!"})
        
@app.post("/admin/login")  
def admin_login(payload: AdminLoginRequest):
    query = "SELECT hashed_pw FROM users AS u WHERE u.role = :role AND u.user_name = :user_name"
    with engine.connect() as db_connection:
        response=db_connection.execute(text(query),{
            "user_name":payload.username,
            "role":"admin"
        })
        result=response.fetchone()
        if result is None: 
            return {"error": "Invalid credentials"}
       
        stored_hash = result.hashed_pw  # or result[0] if row tuple
        if stored_hash == payload.password: 
            token=create_access_token(payload.username,"admin")
            return {"access_token": token, "token_type": "bearer"}

    return {"error": "Invalid credentials"}


def _extract_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1].strip() or None


@app.get("/admin/session")
def admin_session(authorization: Optional[str] = Header(default=None)):
    token = _extract_bearer_token(authorization)
    payload = verify_access_token(token) if token else None
    if not payload or payload.get("role") != "admin":
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    return {"ok": True}


@app.get("/admin/dashboard")
def admin_dashboard(authorization: Optional[str] = Header(default=None)):
    token = _extract_bearer_token(authorization)
    payload = verify_access_token(token) if token else None
    if not payload or payload.get("role") != "admin":
        return JSONResponse({"error": "Unauthorized"}, status_code=401)

    with engine.connect() as db_connection:
        customers = db_connection.execute(
            text("SELECT COUNT(*) FROM users WHERE role = :role"),
            {"role": "customer"},
        ).scalar_one()
        orders_total = db_connection.execute(text("SELECT COUNT(*) FROM orders")).scalar_one()

    return {
        "pendingBakery": 0,
        "confirmedBakery": 0,
        "products": 0,
        "customers": customers,
        "ordersTotal": orders_total,
    }


def _require_admin(authorization: Optional[str]) -> Optional[dict]:
    token = _extract_bearer_token(authorization)
    payload = verify_access_token(token) if token else None
    if not payload or payload.get("role") != "admin":
        return None
    return payload


@app.get("/admin/bakery-capacity")
def admin_bakery_capacity_get(authorization: Optional[str] = Header(default=None)):
    if not _require_admin(authorization):
        return JSONResponse({"error": "Unauthorized"}, status_code=401)

    today = date.today()
    query_statement= text(""" SELECT *
                        FROM cap_table as t
                        WHERE t.bussiness_date == :today
                    """)
    with engine.connect() as db_connection:
        try:
            db_connection.execute(query_statement,{
                "today": today
            })
        except Exception:
            db_connection.rollback()
            raise 
        return ({"Capicity set successfully ": today })

@app.put("/admin/bakery-capacity")
def admin_bakery_capacity_put(
    payload: BakeryCapacityUpdate,
    authorization: Optional[str] = Header(default=None),
):
    
 
    return {
        "businessDate": "",
        "maxLoaves": "",
        "usedLoaves": 0,
    }


@app.post("/order_bread/{bread_type}/{unit}/{price}")
def order_bread(bread_type:str,unit:int,price:float, customerInfo:Customer):
       customer_first_name=customerInfo.first_name
       customer_last_name=customerInfo.last_name
       customer_phone_number=customerInfo.phone_number
       customer_full_name=f'{customer_first_name} {customer_last_name}'
        
       query_statement=text("INSERT INTO bread_order (product_id,customer_name,bread_type,base_price,total_price,unit,phone_number,order_time) Values(gen_random_uuid(),:cus_name,:breadType,:basePrice,:totalPrice,:units,:phoneNumber,:order_time)")
       with engine.connect() as db_connection:
            try:
                db_connection.execute(query_statement, {
                    "cus_name": customer_full_name,
                    "breadType": bread_type,
                    "basePrice": price,
                    "totalPrice":price * unit,
                    "units":unit,
                    "phoneNumber":customer_phone_number,
                    "order_time": datetime.now(ZoneInfo("US/Eastern"))
                })
                db_connection.commit()
            except Exception:
                    db_connection.rollback()
                    raise

        
       return ({"Message":"Successfully placed"})
