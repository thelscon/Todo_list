"use strict";
function isEditConfirmationNote(value) {
    return 'confirmation' in value ? true : false;
}
function isEditDefaultNote(value) {
    return !('confirmation' in value) ? true : false;
}
function isConfirmationNote(value) {
    return value instanceof ConfirmationNote ? true : false;
}
function isDefaultNote(value) {
    return value instanceof DefaultNote ? true : false;
}
class Note {
    _name;
    _dateOfCreation = new Date;
    _dateOfEdition;
    _status = false;
    get name() {
        return this._name;
    }
    get dateOfCreation() {
        return this._dateOfCreation;
    }
    get dateOfEdition() {
        return this._dateOfEdition;
    }
    get status() {
        return this._status;
    }
    constructor(name) {
        this._name = name;
        this._dateOfCreation = new Date;
    }
    completedNote() {
        this._status = true;
    }
}
class DefaultNote extends Note {
    _content;
    get content() {
        return this._content;
    }
    constructor(name, content) {
        super(name);
        this._content = content;
    }
    static Instantiation(name, content) {
        return content ? new DefaultNote(name, content) : undefined;
    }
    editNote(editNote) {
        const name = editNote.name;
        const content = editNote.content;
        let editStatus = false;
        if (name) {
            this._name = name;
            editStatus = true;
        }
        if (content) {
            this._content = content;
            if (!editStatus) {
                editStatus = true;
            }
        }
        if (editStatus) {
            this._dateOfEdition = new Date;
        }
    }
}
class ConfirmationNote extends Note {
    _content;
    get content() {
        return this._content;
    }
    constructor(name, content) {
        super(name);
        this._content = content;
    }
    static Instantiation(name, content) {
        return content ? new ConfirmationNote(name, content) : undefined;
    }
    editNote(editNote) {
        if (editNote.confirmation) {
            const name = editNote.name;
            const content = editNote.content;
            let editStatus = false;
            if (name) {
                this._name = name;
                editStatus = true;
            }
            if (content) {
                this._content = content;
                if (!editStatus) {
                    editStatus = true;
                }
            }
            if (editStatus) {
                this._dateOfEdition = new Date;
            }
        }
    }
}
class NoteID {
    _id;
    _note;
    get id() {
        return this._id;
    }
    get note() {
        return this._note;
    }
    constructor(_id, _note) {
        this._id = _id;
        this._note = _note;
    }
}
class Notes {
    _listOfNotes = [];
    get listOfNotes() {
        return this._listOfNotes;
    }
    newID() {
        let id;
        do {
            id = Number(Math.random()
                .toString()
                .substring(2));
        } while (id === 0 || this.listOfNotes.some(item => item.id === id));
        return id;
    }
    addNote(note) {
        if (note) {
            this._listOfNotes.push(new NoteID(this.newID(), note));
        }
    }
    deleteNote(index) {
        if (index >= 0 && index < this.listOfNotes.length) {
            this.listOfNotes.splice(index, 1);
        }
    }
    editNote(index, editNote) {
        if (index >= 0 && index < this.listOfNotes.length) {
            const currentNote = this.listOfNotes[index];
            if (isConfirmationNote(currentNote.note)) {
                // тип заметки "подтверждение при редактировании", 
                // проверка доступности поля подтверждения confirmationDefaultNote | ConfirmationNote
                if (isEditConfirmationNote(editNote)) {
                    currentNote.note.editNote(editNote);
                }
            }
            else {
                // игнорирование типа с подтверждением в типе без, хотя полями они совсместимы, формальность :)
                if (isEditDefaultNote(editNote)) {
                    currentNote.note.editNote(editNote);
                }
            }
        }
    }
    completedNote(index) {
        if (index >= 0 && index < this.listOfNotes.length) {
            if (this._listOfNotes[index].note.status === false)
                this._listOfNotes[index].note.completedNote();
        }
    }
    viewNoteById(id) {
        return String(id).length === 16 ? this._listOfNotes.find(noteID => noteID.id === id)?.note : undefined;
    }
    viewAllNotes() {
        return this._listOfNotes.map(noteID => noteID.note);
    }
    numberOfAllNotes() {
        return this._listOfNotes.length;
    }
    outstandingNotes() {
        return this._listOfNotes.filter(item => item.note.status === false).length;
    }
    searchByName(searchName) {
        return this._listOfNotes.find(item => item.note.name.toLocaleLowerCase() === searchName.toLocaleLowerCase())?.note;
    }
    searchByContent(searchContent) {
        return this._listOfNotes.find(item => item.note.content.toLocaleLowerCase().includes(searchContent.toLocaleLowerCase()))?.note;
    }
    sortByStatus() {
        return [...this._listOfNotes].sort((a, b) => {
            if (a.note.status === b.note.status) {
                return 0;
            }
            else {
                if (a.note.status) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
        });
    }
    sortByCreationTime() {
        return [...this._listOfNotes].sort((a, b) => {
            if (a.note.dateOfCreation === b.note.dateOfCreation) {
                return 0;
            }
            else {
                if (a.note.dateOfCreation > b.note.dateOfCreation) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
        });
    }
}
// // examples
// const s = new Notes
// const r =  ConfirmationNote.Instantiation ('cName' , 'cContent')
// s.addNote (r)
// s.addNote (ConfirmationNote.Instantiation ('name' , ''))
// s.addNote (ConfirmationNote.Instantiation ('name2' , 'content2'))
// s.addNote (DefaultNote.Instantiation ('naMes' , 'go to me'))
// s.addNote (DefaultNote.Instantiation ('nameq' , 'contentq'))
// console.dir (s.listOfNotes)
// // s.deleteNote (1);
// s.editNote (1  , {name : '' , content : 'asd' , confirmation : true})
// s.listOfNotes[0].note.completedNote()
// s.listOfNotes[2].note.completedNote()
// console.log (s.numberOfAllNotes())
// console.log (s.outstandingNotes())
// console.log (s.viewNoteById(s.listOfNotes[0].id));
// console.log (s.viewAllNotes())
// console.log (s.searchByName ('nameQ'))
// console.log (s.searchByContent ('go To'));
// console.log (s.sortByStatus())
// console.log (s.sortByCreationTime())
// console.log (s.listOfNotes)
// s.completedNote(1)
// console.log (s.listOfNotes)
