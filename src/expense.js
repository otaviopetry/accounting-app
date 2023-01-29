export default class Expense {
    constructor({ category, value, date, note }) {
        this.category = category;
        this.value = value;
        this.date = date;
        this.note = note;
    }

    formatted(language) {
        const mapDate = (date) => {
            const [year, month, day] = date.split('-').map(Number);

            return new Date(year, (month - 1), day);
        }

        return {
            category: this.category,
            value: new Intl.NumberFormat(
                language,
                { style: 'currency', currency: 'BRL' }
            ).format(this.value),
            date: new Intl
                .DateTimeFormat(
                    language,
                    { month: 'long', day: '2-digit', year: 'numeric' },
                )
                .format(mapDate(this.date)),
            note: new Intl.ListFormat(
                language,
                { style: 'long', type: 'conjunction' }
            ).format(this.note),
        }
    }

    static generateInstanceFromObject(data) {
        return new Expense({
            category: data.category,
            value: Number(data.value),
            date: data.date || new Date().toISOString().split('T')[0],
            note: data.note.split(',').map(string => string.trim()),
        });
    }
}