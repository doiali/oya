"""Remove cascades

Revision ID: 9c4941243ddf
Revises: 52e74852e487
Create Date: 2024-11-18 16:54:13.421201

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9c4941243ddf'
down_revision = '52e74852e487'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('activities_user_id_fkey', 'activities', type_='foreignkey')
    op.create_foreign_key('activities_user_id_fkey', 'activities', 'users', ['user_id'], ['id'], ondelete='RESTRICT')
    op.drop_constraint('entries_interval_id_fkey', 'entries', type_='foreignkey')
    op.drop_constraint('entries_activity_id_fkey', 'entries', type_='foreignkey')
    op.create_foreign_key('entries_activity_id_fkey', 'entries', 'activities', ['activity_id'], ['id'], ondelete='RESTRICT')
    op.create_foreign_key('entries_interval_id_fkey', 'entries', 'intervals', ['interval_id'], ['id'])
    op.drop_constraint('intervals_user_id_fkey', 'intervals', type_='foreignkey')
    op.create_foreign_key('intervals_user_id_fkey', 'intervals', 'users', ['user_id'], ['id'], ondelete='RESTRICT')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('intervals_user_id_fkey', 'intervals', type_='foreignkey')
    op.create_foreign_key('intervals_user_id_fkey', 'intervals', 'users', ['user_id'], ['id'])
    op.drop_constraint('entries_interval_id_fkey', 'entries', type_='foreignkey')
    op.drop_constraint('entries_activity_id_fkey', 'entries', type_='foreignkey')
    op.create_foreign_key('entries_activity_id_fkey', 'entries', 'activities', ['activity_id'], ['id'])
    op.create_foreign_key('entries_interval_id_fkey', 'entries', 'intervals', ['interval_id'], ['id'])
    op.drop_constraint('activities_user_id_fkey', 'activities', type_='foreignkey')
    op.create_foreign_key('activities_user_id_fkey', 'activities', 'users', ['user_id'], ['id'])
    # ### end Alembic commands ###