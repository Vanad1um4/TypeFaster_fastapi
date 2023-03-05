from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./sqlite.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Options(Base):
    __tablename__ = "options"

    id = Column(Integer, primary_key=True)
    dark_mode = Column(Boolean)
    show_errors = Column(Boolean)
    window_width = Column(Integer)
    show_stats_bar = Column(Boolean)


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True)
    name = Column(String)

    texts = relationship("Text", cascade='all,delete', backref='book')


class Text(Base):
    __tablename__ = "texts"

    id = Column(Integer, primary_key=True)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"))
    chapter = Column(String)
    text = Column(String)
    done = Column(Boolean)
    stats_args = Column(String)
    stats_raw = Column(String)
