"""rename hero_card_instances to mercenary_card_instances, add players and player_states

Revision ID: a1b2c3d4e5f6
Revises: 3e0b26118647
Create Date: 2026-04-22 12:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '3e0b26118647'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Rename hero_card_instances -> mercenary_card_instances
    op.rename_table('hero_card_instances', 'mercenary_card_instances')

    # Add players table
    op.create_table('players',
        sa.Column('player_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('created_at', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('player_id')
    )

    # Add player_states table (append-only versioned snapshots)
    op.create_table('player_states',
        sa.Column('player_id', sa.String(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.String(), nullable=False),
        sa.Column('change_note', sa.String(), nullable=True),
        sa.Column('data', sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint('player_id', 'version')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('player_states')
    op.drop_table('players')
    op.rename_table('mercenary_card_instances', 'hero_card_instances')
