import crud
import json


def options_prep(db):
    db_options = crud.get_all_options(db)
    options_dict = {}
    options_dict['dark_mode'] = db_options.__dict__['dark_mode']
    options_dict['show_errors'] = db_options.__dict__['show_errors']
    options_dict['window_width'] = db_options.__dict__['window_width']
    options_dict['show_stats_bar'] = db_options.__dict__['show_stats_bar']
    return options_dict


def books_prep(db):
    db_books = crud.get_all_books(db)
    books_list = [[book.id, book.name] for book in db_books]
    return books_list


def texts_prep_before_writing_to_db(text: str) -> list[str]:
    while '\n\n' in text:
        text = text.replace('\n\n', '\n')
    while '  ' in text:
        text = text.replace('  ', ' ')
    while '…' in text:
        text = text.replace('…', '...')

    texts_list = []
    while text:
        line_break_pos = text.find('\n', 10)
        if line_break_pos != -1:
            texts_list.append(text[:line_break_pos])
            text = text[line_break_pos+1:]
        if line_break_pos == -1:
            texts_list.append(text)
            text = ''

    return texts_list


def texts_prep_before_sending_back(book_id: int, db):
    db_texts = crud.get_texts_by_book_id(db, book_id)

    texts = []
    chapter = ''
    k = -1
    for text in db_texts:
        if text.__dict__['chapter'] != chapter:
            k += 1
            chapter = text.__dict__['chapter']
            texts.append({chapter: []})
        text_str = text.__dict__['text']

        if len(text_str) > 35:
            text_str = text_str[:35] + '...'

        if text.__dict__['stats_args']:
            stats_args = json.loads(text.__dict__['stats_args'])
        else:
            stats_args = {}

        cpm = 0
        wpm = 0
        acc = 0.00
        chars = 0
        words = 0
        time = 0
        errors = 0

        if stats_args:
            cpm = stats_args['cpm']
            wpm = stats_args['wpm']
            acc = stats_args['acc']
            chars = stats_args['chars']
            words = stats_args['words']
            time = stats_args['time']
            errors = stats_args['errors']

        texts[k][chapter].append({'text_id': text.__dict__['id'], 'text_preview': text_str, 'done': text.__dict__['done'],
                                 'cpm': cpm, 'wpm': wpm, 'acc': acc, 'chars': chars, 'words': words, 'time': time, 'errors': errors})

    return texts


def text_prep_for_typing(db, text_id):

    result = crud.get_text_by_text_id_for_typing(db, text_id)
    print(result)
    text_dict = result['text_dict']
    next_book = result['next_book']
    data_dict = {
        'text_id': text_id,
        'complete': False,
        'cpm': 0,
        'wpm': 0,
        'acc': 0.00,
        'chars': 0,
        'words': 0,
        'errors': 0,
        'time': 0,
        'next': next_book
    }

    if text_dict:
        data_dict['text'] = text_dict['text']
        stats = json.loads(text_dict['stats_args'])
        print(stats)

        if stats:
            data_dict['complete'] = True
            data_dict['cpm'] = stats['cpm']
            data_dict['wpm'] = stats['wpm']
            data_dict['acc'] = stats['acc']
            data_dict['chars'] = stats['chars']
            data_dict['words'] = stats['words']
            data_dict['errors'] = stats['errors']
            data_dict['time'] = stats['time']

    return data_dict


def stats_prep_for_db_save(text_id, stats, db):
    # print(stats)

    # stats = json.dumps(json.loads(request.body))
    # print(stats['stats'], stats['args'])
    # result_old = db_save_stats(text_id, user_id, json.dumps(stats['stats']), json.dumps(stats['args']))

    first_time = stats['stats']['0']['time']
    result_list = []
    for i, letter in enumerate(stats['stats']):
        if i > 0:
            result_list.append([stats['stats'][letter]['txt'],
                                stats['stats'][letter]['time']-first_time,
                                stats['stats'][letter]['error']])
        else:
            result_list.append([stats['stats'][letter]['txt'],
                                first_time,
                                stats['stats'][letter]['error']])

    # print(result_list)
    # print(stats['args'])
    result_new = crud.save_stats(db, text_id, stats['args'], result_list)
