from sqlalchemy.orm import Session
import models
import json
import schemas


def dictify(db_obj):
    return {k: v for k, v in db_obj.__dict__.items() if k != '_sa_instance_state'}


### OPTIONS CRUDs #############################################################

def get_all_options(db: Session):
    db_options = db.query(models.Options).filter(models.Options.id == 1).first()
    if db_options is None:
        new_options = create_options(db)
        return new_options
    return db_options


def create_options(db: Session, dark_mode=True, show_errors=True, window_width=800, show_stats_bar=True):
    db_options = models.Options(dark_mode=dark_mode, show_errors=show_errors, window_width=window_width, show_stats_bar=show_stats_bar)
    db.add(db_options)
    db.commit()
    # db.refresh(db_options)
    return db_options


def set_all_options(db: Session, options: schemas.OptionsSet):
    try:
        db_options = db.query(models.Options).filter(models.Options.id == 1).first()
        if db_options is None:
            create_options(db)
        else:
            db_options.dark_mode = options.dark_mode
            db_options.show_errors = options.show_errors
            db_options.window_width = options.window_width
            db_options.show_stats_bar = options.show_stats_bar
            db.add(db_options)
            db.commit()
        return True
    except Exception as exc:
        print(exc)
        db.rollback()
        db.flush()
        return False


### BOOKS CRUDS ###############################################################

def create_book(db: Session, name: str):
    db_book = models.Book(name=name)
    db.add(db_book)
    db.commit()
    # db.refresh(db_book)
    return db_book


def get_all_books(db: Session):
    return db.query(models.Book).all()


def get_book_by_id(db: Session, id: int):
    return db.query(models.Book).get(id)


def get_book_by_name(db: Session, name: str):
    return db.query(models.Book).filter(models.Book.name == name).first()


def rename_book(db: Session, id: int, name: str):
    db_book = db.query(models.Book).filter(models.Book.id == id).first()
    if db_book is not None:
        db_book.name = name
        db.add(db_book)
        db.commit()
    return db_book


def delete_book_by_id(db: Session, id: int):
    try:
        db_book = db.query(models.Book).get(id)
        db.delete(db_book)
        db.commit()
        return True
    except Exception as exc:
        print(exc)
        db.rollback()
        db.flush()
        return False


### TEXTS CRUDS ###############################################################

def batch_create_text(db: Session, book_id: int, chapter: str, texts_list: list[str]):
    try:
        for text in texts_list:
            db_text = models.Text(book_id=book_id, chapter=chapter, text=text, done=False, stats_args=json.dumps(''), stats_raw=json.dumps(''))
            db.add(db_text)
            db.commit()
            # db.refresh(db_text)
        return True
    except Exception as exc:
        print(exc)
        db.rollback()
        db.flush()
        return False


def get_all_texts(db: Session):
    return db.query(models.Text).all()


def get_text_by_text_id_for_typing(db: Session, text_id: int):
    db_text = db.query(models.Text).get(text_id)
    print(db_text.book_id)
    all_texts = db.query(models.Text).filter(models.Text.book_id == db_text.book_id).all()
    ids = [text.id for text in all_texts]
    curr_text_id_idx = ids.index(text_id)
    next_text_id_list = ids[curr_text_id_idx+1:curr_text_id_idx+2]
    if next_text_id_list:
        next_book = next_text_id_list[0]
    else:
        next_book = None
    return {'text_dict': dictify(db_text), 'next_book': next_book}


def get_texts_by_chapter(db: Session, text_chapter: str):
    return db.query(models.Text).filter(models.Text.chapter == text_chapter).all()


def get_texts_by_book_id(db: Session, book_id: int):
    return db.query(models.Text).filter(models.Text.book_id == book_id).all()


def delete_text_by_text_id(db: Session, text_id: int):
    try:
        db_text = db.query(models.Text).get(text_id)
        db.delete(db_text)
        db.commit()
        return True
    except Exception as exc:
        print(exc)
        db.rollback()
        db.flush()
        return False


def delete_text_by_chapter(db: Session, text_chapter: str):
    try:
        db.query(models.Text).filter(models.Text.chapter == text_chapter).delete()
        db.commit()
        return True
    except Exception as exc:
        print(exc)
        db.rollback()
        db.flush()
        return False


### STATS CRUDS ###############################################################

def save_stats(db: Session, text_id: int, stats_args: dict, stats_raw: list):
    try:
        db_text = db.query(models.Text).get(text_id)
        print(dictify(db_text))
        if db_text is not None:
            db_text.done = True
            db_text.stats_args = json.dumps(stats_args)
            db_text.stats_raw = json.dumps(stats_raw)
            db.add(db_text)
            db.commit()
        return True
    except Exception as exc:
        print(exc)
        db.rollback()
        db.flush()
        return False
