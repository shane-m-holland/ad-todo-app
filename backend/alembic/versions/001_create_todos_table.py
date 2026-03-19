"""Create todos table

Revision ID: 001
Revises:
Create Date: 2026-03-19 14:30:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create todos table."""
    op.create_table(
        "todos",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("completed", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_todos_id"), "todos", ["id"], unique=False)
    op.create_index(op.f("ix_todos_completed"), "todos", ["completed"], unique=False)


def downgrade() -> None:
    """Drop todos table."""
    op.drop_index(op.f("ix_todos_completed"), table_name="todos")
    op.drop_index(op.f("ix_todos_id"), table_name="todos")
    op.drop_table("todos")
