from pydantic import BaseModel


class OptionsSet(BaseModel):
    dark_mode: bool
    show_errors: bool
    window_width: int
    show_stats_bar: bool


class BookName(BaseModel):
    name: str


class TextCreate(BaseModel):
    book_id: int
    chapter: str
    text: str


class TextModel(TextCreate):
    id: int


class TextChapter(BaseModel):
    chapter: str


class StatsReturn(BaseModel):
    class StatsReturnArgs(BaseModel):
        acc: float
        chars: int
        cpm: int
        errors: int
        time: int
        words: int
        wpm: int

    class StatsReturnSingleChar(BaseModel):
        time: int
        error: int
        txt: str

    args: StatsReturnArgs
    stats: dict[str, StatsReturnSingleChar]

    # class Config:
    #     orm_mode = True
