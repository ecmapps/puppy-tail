"""empty message

<<<<<<<< HEAD:migrations/versions/69f07475262d_.py
Revision ID: 69f07475262d
Revises: 
Create Date: 2023-09-15 22:29:58.898667
========
Revision ID: 2b077bbfcd11
Revises: 
Create Date: 2023-09-15 20:51:48.175493
>>>>>>>> c793093afec4f41a6a73af50d1c173c27cce66ec:migrations/versions/2b077bbfcd11_.py

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
<<<<<<<< HEAD:migrations/versions/69f07475262d_.py
revision = '69f07475262d'
========
revision = '2b077bbfcd11'
>>>>>>>> c793093afec4f41a6a73af50d1c173c27cce66ec:migrations/versions/2b077bbfcd11_.py
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('token_blocked_list',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('token', sa.String(length=1000), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('token')
    )
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('first_name', sa.String(length=250), nullable=False),
    sa.Column('last_name', sa.String(length=250), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('password', sa.String(length=255), nullable=False),
    sa.Column('description', sa.String(length=1000), nullable=True),
    sa.Column('location', sa.String(length=255), nullable=False),
    sa.Column('profile_pic', sa.String(length=150), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('user_type', sa.String(length=50), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('keeper',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('hourly_pay', sa.Float(), nullable=False),
    sa.Column('experience', sa.Date(), nullable=True),
    sa.Column('services', sa.ARRAY(sa.String(length=50)), nullable=True),
    sa.ForeignKeyConstraint(['id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('owner',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('booking',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('start_date', sa.DateTime(), nullable=False),
    sa.Column('end_date', sa.DateTime(), nullable=False),
    sa.Column('status', sa.Enum('pending', 'approved', 'archived', 'canceled', 'done', 'pto', name='status'), nullable=True),
    sa.Column('keeper_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['keeper_id'], ['keeper.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('pet',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('size', sa.String(length=100), nullable=False),
    sa.Column('category', sa.String(length=50), nullable=False),
    sa.Column('description', sa.String(length=500), nullable=True),
    sa.Column('profile_pic', sa.String(length=150), nullable=True),
    sa.Column('owner_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['owner_id'], ['owner.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('booking_pet',
    sa.Column('booking_id', sa.Integer(), nullable=False),
    sa.Column('pet_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['booking_id'], ['booking.id'], ),
    sa.ForeignKeyConstraint(['pet_id'], ['pet.id'], ),
    sa.PrimaryKeyConstraint('booking_id', 'pet_id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('booking_pet')
    op.drop_table('pet')
    op.drop_table('booking')
    op.drop_table('owner')
    op.drop_table('keeper')
    op.drop_table('user')
    op.drop_table('token_blocked_list')
    # ### end Alembic commands ###
