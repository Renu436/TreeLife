from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from database import Base


class Tree(Base):
    __tablename__ = "trees"

    id = Column(Integer, primary_key=True, index=True)
    common_name = Column(String, nullable=False)
    scientific_name = Column(String, nullable=True)
    search_query = Column(String, nullable=False)
    tree_type = Column(String, default="deciduous")
    knowledge_data = Column(JSON, nullable=True)
    total_leaves = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    aliases = Column(JSON, default=list)


class ForestEntry(Base):
    __tablename__ = "forest_entries"

    id = Column(Integer, primary_key=True, index=True)
    tree_id = Column(Integer, ForeignKey("trees.id"), nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)
