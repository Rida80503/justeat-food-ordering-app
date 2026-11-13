"""
Admin API routes.

WHY: Platform administration endpoints for system metrics and owner approvals.
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin
from app.core.exceptions import UserNotFoundException
from app.db.database import get_db
from app.models.order import Order
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.common import BaseResponse
from app.schemas.user import UserResponse

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get(
    "/stats",
    response_model=BaseResponse[dict],
    summary="Get admin dashboard stats",
)
@router.get(
    "/dashboard/stats",
    response_model=BaseResponse[dict],
    summary="Get admin dashboard stats",
)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Return aggregate counts for platform overview using the actual database."""
    total_users = db.query(User).count()
    total_customers = db.query(User).filter(User.role == "CUSTOMER").count()
    total_owners = db.query(User).filter(User.role == "OWNER").count()
    total_admins = db.query(User).filter(User.role == "ADMIN").count()
    pending_owners = (
        db.query(User)
        .filter(User.role == "OWNER", User.approval_status == "PENDING")
        .count()
    )
    approved_owners = (
        db.query(User)
        .filter(User.role == "OWNER", User.approval_status == "APPROVED")
        .count()
    )
    rejected_owners = (
        db.query(User)
        .filter(User.role == "OWNER", User.approval_status == "REJECTED")
        .count()
    )
    total_restaurants = db.query(Restaurant).count()
    total_orders = db.query(Order).count()

    return BaseResponse(
        success=True,
        message="Admin dashboard statistics retrieved",
        data={
            "total_users": total_users,
            "total_customers": total_customers,
            "total_owners": total_owners,
            "total_admins": total_admins,
            "pending_owners": pending_owners,
            "approved_owners": approved_owners,
            "rejected_owners": rejected_owners,
            "total_restaurants": total_restaurants,
            "total_orders": total_orders,
        },
    )


@router.get(
    "/owners",
    response_model=BaseResponse[list[UserResponse]],
    summary="List restaurant owner applications",
)
async def list_owner_applications(
    status: str | None = Query(default=None),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Return owner accounts, optionally filtered by approval status."""
    query = db.query(User).filter(User.role == "OWNER")
    if status:
        query = query.filter(User.approval_status == status.upper())

    owners = query.order_by(User.created_at.desc()).all()

    return BaseResponse(
        success=True,
        message="Owner applications retrieved",
        data=[UserResponse.model_validate(owner) for owner in owners],
    )


@router.patch(
    "/owners/{owner_id}/approve",
    response_model=BaseResponse[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="Approve restaurant owner application",
)
async def approve_owner_application(
    owner_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Approve an owner application and activate the account."""
    owner = db.query(User).filter(User.id == owner_id, User.role == "OWNER").first()
    if not owner:
        raise UserNotFoundException("Owner")

    owner.approval_status = "APPROVED"
    owner.is_active = True
    db.commit()
    db.refresh(owner)

    return BaseResponse(
        success=True,
        message="Owner application approved successfully",
        data=UserResponse.model_validate(owner),
    )


@router.patch(
    "/owners/{owner_id}/reject",
    response_model=BaseResponse[UserResponse],
    summary="Reject restaurant owner application",
)
async def reject_owner_application(
    owner_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Reject an owner application and deactivate the account."""
    owner = db.query(User).filter(User.id == owner_id, User.role == "OWNER").first()
    if not owner:
        raise UserNotFoundException("Owner")

    owner.approval_status = "REJECTED"
    owner.is_active = False
    db.commit()
    db.refresh(owner)

    return BaseResponse(
        success=True,
        message="Owner application rejected successfully",
        data=UserResponse.model_validate(owner),
    )
