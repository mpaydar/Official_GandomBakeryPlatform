from uuid import UUID


from pydoc import describe
from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String, TIMESTAMP, true, Float, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class users(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    email = Column(String,nullable=True)
    first_name = Column(String)
    last_name=Column(String)
    user_name=Column(String)
    role = Column(String,nullable=True)
    hashed_pw = Column(String)
    is_active = Column(Boolean,nullable=True)
    created_at = Column(TIMESTAMP, nullable=True)


class orders(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    status = Column(String,nullable= True)
    version = Column(String,nullable=True)
    customer_contact = Column(String, nullable=True)
    stripe_session_id=Column(String, nullable=True)
    requested_time = Column(TIMESTAMP, nullable=True)
    confirmed_time = Column(TIMESTAMP, nullable=True)
    proposed_time = Column(TIMESTAMP, nullable=True)
    proposal_expir = Column(TIMESTAMP, nullable=True)
    reschedule_count = Column(Integer, nullable=False, default=0)
    notes = Column(String, nullable=True)
    idempotency_key = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

class bakery_notification(Base):
    __tablename__="notification"
    notification_id=Column(UUID(as_uuid=True), primary_key=True, index=True)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), index=True)
    is_read=Column(Boolean)
    created_at=Column(TIMESTAMP)


class bakery_daily_capacity(Base):
    __tablename__ = "bakery_daily_capacity"

    business_date = Column(Date, primary_key=True)
    max_loaves = Column(Integer, nullable=False)

class bread_order(Base):
    __tablename__ = "bread_order"

    product_id=Column(
        UUID(as_uuid=True),
        primary_key=True,
        index=True,
        server_default=text("gen_random_uuid()"),
    )
    customer_name=Column(String)
    bread_type=Column(String)
    base_price=Column(Float)
    total_price=Column(Float,nullable=True)
    unit=Column(String)
    phone_number=Column(String)
    order_time=Column(TIMESTAMP(timezone=True),nullable=True)

