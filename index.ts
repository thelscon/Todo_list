const enum EStatus {
    Completed ,
    NotCompleted
}

type AllTypesOfNotes = DefaultNote | ConfirmationNote

type EditNoteType<T extends AllTypesOfNotes> = 
    T extends DefaultNote ? { name ?: string , content ?: string }
    : T extends ConfirmationNote ? { name ?: string , content ?: string , confirmation : boolean }
    : never

interface INote {
    name : string ,
    content : string ,
    readonly dateOfCreation : Date ,
    dateOfEdition : Date | undefined,
    status : EStatus

    editNote : (note : EditNoteType<AllTypesOfNotes>) => void
    completedNote : () => void
}

interface INoteID {
    readonly id : number
    readonly note : AllTypesOfNotes
}

interface INotes {
    readonly listOfNotes : Array<INoteID>

    addNote : (note : AllTypesOfNotes | undefined) => void
    deleteNote : (index : number) => void
    editNote : (index : number , note : EditNoteType<AllTypesOfNotes>) => void
    completedNote : (index : number) => void
    viewNoteById : (id : number) => AllTypesOfNotes | undefined
    viewAllNotes : () => Array<AllTypesOfNotes>
    numberOfAllNotes : () => number
    outstandingNotes : () => number
    searchByName : (searchName : string) => AllTypesOfNotes | undefined
    searchByContent : (searchContent : string) => AllTypesOfNotes | undefined
    sortByStatus : () => Array<INoteID>
    sortByCreationTime : () => Array<INoteID>
}

function isEditConfirmationNote (value : EditNoteType<AllTypesOfNotes>) : value is EditNoteType<ConfirmationNote> {
    return 'confirmation' in value
}
function isEditDefaultNote (value : EditNoteType<AllTypesOfNotes>) : value is EditNoteType<DefaultNote> {
    return !('confirmation' in value)
}
function isConfirmationNote (value : AllTypesOfNotes) : value is ConfirmationNote {
    return value instanceof ConfirmationNote
}
function isDefaultNote (value : AllTypesOfNotes) : value is DefaultNote {
    return value instanceof DefaultNote
}

abstract class Note implements INote {
    abstract content: string
    abstract editNote (note  : EditNoteType<AllTypesOfNotes>) : void

    protected _name !: string
    private readonly _dateOfCreation : Date = new Date
    protected _dateOfEdition : Date | undefined
    private _status : EStatus = EStatus.NotCompleted

    get name () : string {
        return this._name
    }

    get dateOfCreation () : Date {
        return this._dateOfCreation
    }

    get dateOfEdition () : Date | undefined{
        return this._dateOfEdition
    }

    get status () : EStatus {
        return this._status
    }

    constructor (
        name : string
    ) {
        this._name = name
        this._dateOfCreation = new Date
    }

    completedNote () {
        this._status = EStatus.Completed
    }
}

class DefaultNote extends Note {
    private _content !: string

    get content () : string {
        return this._content
    }

    private constructor (
        name : string ,
        content : string
    ) {
        super (name)
        this._content = content
    }

    static Instantiation (name : string , content : string) : DefaultNote | undefined {
        return content ? new DefaultNote (name , content) : undefined
    }

    editNote(editNote : EditNoteType<DefaultNote>) : void {
        const name = editNote.name
        const content = editNote.content
        let editStatus = false
        if (name) {
            this._name = name
            editStatus = true
        }
        if (content) {
            this._content = content
            if (!editStatus) {
                editStatus = true
            }
        }
        if (editStatus) {
            this._dateOfEdition = new Date
        }
    }
}

class ConfirmationNote extends Note {
    private _content !: string

    get content () : string {
        return this._content
    }

    private constructor (
        name : string ,
        content : string
    ) {
        super (name)
        this._content =  content
    }

    static Instantiation (name : string , content : string) : ConfirmationNote | undefined {
        return content ? new ConfirmationNote (name , content) : undefined
    }

    editNote (editNote : EditNoteType<ConfirmationNote>) : void {
        if (editNote.confirmation) {
            const name = editNote.name
            const content = editNote.content
            let editStatus = false
            if (name) {
                this._name = name
                editStatus = true
            }
            if (content) {
                this._content = content
                if (!editStatus) {
                    editStatus = true
                }
            }
            if (editStatus) {
                this._dateOfEdition = new Date
            }
        }
    }
}

class NoteID {
    get id () : number {
        return this._id
    }
    get note () : AllTypesOfNotes {
        return this._note
    }

    constructor (
        private readonly _id : number ,
        private readonly _note : AllTypesOfNotes
    ) {}
}

class Notes implements INotes {
    private _listOfNotes : Array<INoteID> = []

    get listOfNotes () : Array<INoteID> {
        return this._listOfNotes
    }
    
    private newID () : number {
        let id : number
        do {
            id = Number (
                Math.random ()
                .toString ()
                .substring (2)
            )
        } while (id === 0 || this.listOfNotes.some (item => item.id === id))

        return id
    }

    addNote (note : AllTypesOfNotes | undefined) {
        if (note) {
            this._listOfNotes.push (new NoteID (this.newID() , note))
        }
    }
    deleteNote(index: number) {
        if (index >= 0 && index < this.listOfNotes.length) {
            this.listOfNotes.splice (index , 1)
        }
    }
    editNote (index : number , editNote : EditNoteType<AllTypesOfNotes>) {
        if (index >= 0 && index < this.listOfNotes.length) {
            const currentNote = this.listOfNotes[index]
            if (isConfirmationNote (currentNote.note)) {
                // тип заметки "подтверждение при редактировании", 
                // проверка доступности поля подтверждения confirmationDefaultNote | ConfirmationNote
                if (isEditConfirmationNote (editNote)) {
                    currentNote.note.editNote (editNote)
                }
            }
            else {
                // игнорирование типа с подтверждением в типе без, хотя полями они совсместимы, формальность :)
                if (isEditDefaultNote (editNote)) {
                    currentNote.note.editNote (editNote)
                }
            }
        }
    }
    completedNote (index : number) {
        if (index >= 0 && index < this.listOfNotes.length) {
            if (this._listOfNotes[index].note.status === EStatus.NotCompleted)
            this._listOfNotes[index].note.completedNote ()
        }
    }
    viewNoteById (id : number) {
        return String (id).length === 16 ? this._listOfNotes.find (noteID => noteID.id === id)?.note : undefined
    }
    viewAllNotes () {
        return this._listOfNotes.map (noteID => noteID.note)
    }
    numberOfAllNotes () {
        return this._listOfNotes.length
    }
    outstandingNotes () {
        return this._listOfNotes.filter (item => item.note.status === EStatus.NotCompleted).length
    }
    searchByName (searchName : string) {
        return this._listOfNotes.find (item => item.note.name.toLocaleLowerCase() === searchName.toLocaleLowerCase())?.note
    }
    searchByContent (searchContent : string) {
        return this._listOfNotes.find (item => item.note.content.toLocaleLowerCase().includes (searchContent.toLocaleLowerCase()))?.note
    }
    sortByStatus () {
        return [...this._listOfNotes].sort ((a , b) => {
            if (a.note.status === b.note.status) {
                return 0
            }
            else {
                if (a.note.status) {
                    return 1
                }
                else {
                    return -1
                }
            }
        })
    }
    sortByCreationTime () {
        return [...this._listOfNotes].sort ((a , b) => {
            if (a.note.dateOfCreation === b.note.dateOfCreation) {
                return 0
            }
            else {
                if (a.note.dateOfCreation > b.note.dateOfCreation) {
                    return 1
                }
                else {
                    return -1
                }
            }
        })
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

