from typing import Any
from fastapi import FastAPI, Path, Query, HTTPException, Depends, status, Request
from schemas import OptionsSet, TextCreate, TextChapter, BookName, StatsReturn
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from models import Base, engine, SessionLocal
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import logic
import crud
import json

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.mount("/static", StaticFiles(directory='static'), name='static')

templates = Jinja2Templates(directory='templates')


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


### OPTIONS ROUTES ############################################################

@app.get('/api-get-options/')
def get_options(db: Session = Depends(get_db)):
    db_options = crud.get_all_options(db)
    return db_options


@app.put('/api-set-options/', status_code=status.HTTP_204_NO_CONTENT)
def set_options(options: OptionsSet, db: Session = Depends(get_db)):
    crud.set_all_options(db, options)


### BOOKS ROUTES ##############################################################

@app.post('/api-books/add/', status_code=status.HTTP_204_NO_CONTENT)
def create_book(book: BookName, db: Session = Depends(get_db)):
    db_book = crud.get_book_by_name(db, book.name)
    if db_book:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Book with this name already exists")
    crud.create_book(db, book.name)


@app.get('/api-books/get-all/')
def show_all_books(db: Session = Depends(get_db)):
    db_book = crud.get_all_books(db)
    if db_book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="There's no books")
    return db_book


@app.get('/api-books/get-one/{id}')
def show_one_book(id: int, db: Session = Depends(get_db)):
    db_book = crud.get_book_by_id(db, id)
    if db_book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="There's no book with this id")
    return db_book


@app.put("/api-books/rename/{id}", status_code=status.HTTP_204_NO_CONTENT)
def rename_book(id: int, book: BookName, db: Session = Depends(get_db)):
    db_book = crud.get_book_by_id(db, id)
    if db_book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="There's no book with this id")
    return crud.rename_book(db, id, book.name)


@app.delete("/api-books/delete/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(id: int, db: Session = Depends(get_db)):
    db_book = crud.get_book_by_id(db, id)
    if db_book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="There's no book with this id")
    res = crud.delete_book_by_id(db, id)
    if res is True:
        return {'detail': 'Successfully deleted'}
    if res is False:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Something's went wrong...")


### TEXTS ROUTES ##############################################################

@app.post("/api-texts/add/", status_code=status.HTTP_204_NO_CONTENT)
def create_a_text(text: TextCreate, db: Session = Depends(get_db)):
    texts_list = logic.texts_prep_before_writing_to_db(text.text)
    result = crud.batch_create_text(db, text.book_id, text.chapter, texts_list)
    return result


@app.get("/api-texts/get-all/")
def show_all_texts(db: Session = Depends(get_db)):
    db_texts = crud.get_all_texts(db)
    if db_texts is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="There are no texts")
    return db_texts


@app.get("/api-texts/get-texts-by-book-id/{book_id}")
def show_texts_by_book_id(book_id: int, db: Session = Depends(get_db)):
    texts = logic.texts_prep_before_sending_back(book_id, db)
    return JSONResponse(status_code=status.HTTP_200_OK, content={'texts': texts})


@app.delete("/api-texts/delete-by-text-id/{text_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_text_by_text_id(text_id: int, db: Session = Depends(get_db)):
    res = crud.delete_text_by_text_id(db, text_id)
    if res is True:
        return {'detail': 'Successfully deleted'}
    if res is False:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Something's went wrong...")


@app.delete("/api-texts/delete-by-chapter-str/", status_code=status.HTTP_204_NO_CONTENT)
def delete_text_by_chapter_str(text: TextChapter, db: Session = Depends(get_db)):
    res = crud.delete_text_by_chapter(db, text.chapter)
    if res is True:
        return {'detail': 'Successfully deleted'}
    if res is False:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Something's went wrong...")


### RETURN STATS ##############################################################

@app.post('/api-stats/return-stats/{text_id}/', status_code=status.HTTP_204_NO_CONTENT)
def return_stats(text_id: int, stats: StatsReturn, db: Session = Depends(get_db)):
    res = logic.stats_prep_for_db_save(text_id, stats.dict(), db)
    if res is True:
        return {'detail': 'Stats were saved successfully'}
    if res is False:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Something's went wrong...")


### TEMPLATES ROUTES ##########################################################

@app.get('/')
def home_redirect():
    return RedirectResponse('/library/', status_code=status.HTTP_303_SEE_OTHER)


@app.get('/library/', response_class=HTMLResponse)
def show_library_page(request: Request, db: Session = Depends(get_db)):
    options = logic.options_prep(db)
    books = logic.books_prep(db)
    return templates.TemplateResponse("library.html", {"request": request, 'books': json.dumps(books), 'options': json.dumps(options)})


@app.get('/type/{text_id}/', response_class=HTMLResponse)
def show_type_page(text_id: int, request: Request, db: Session = Depends(get_db)):
    options = logic.options_prep(db)
    data = logic.text_prep_for_typing(db, text_id)
    return templates.TemplateResponse("type.html", {"request": request, 'data': json.dumps(data), 'options': json.dumps(options)})
