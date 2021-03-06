"""added check constraint to intervals table to check that end is greater than start

Revision ID: f83cd1c2050a
Revises: c585f1f67f16
Create Date: 2022-01-14 15:36:35.707576

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f83cd1c2050a'
down_revision = 'c585f1f67f16'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_check_constraint(
        'CK_intervals_end_datetime_gt_start_datetime',
        'intervals',
        'end_datetime > start_datetime'
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(
        'CK_intervals_end_datetime_gt_start_datetime',
        'intervals',
    )
    # ### end Alembic commands ###
