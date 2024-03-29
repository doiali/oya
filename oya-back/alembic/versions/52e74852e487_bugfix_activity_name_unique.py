"""bugfix_activity_name_unique

Revision ID: 52e74852e487
Revises: b728a4e97ecc
Create Date: 2022-08-31 20:42:06.981177

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "52e74852e487"
down_revision = "b728a4e97ecc"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint("activities_name_unique", "activities", type_="unique")
    op.create_unique_constraint(
        "activities_name_unique", "activities", ["name", "user_id"]
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint("activities_name_unique", "activities", type_="unique")
    op.create_unique_constraint("activities_name_unique", "activities", ["name"])
    # ### end Alembic commands ###
