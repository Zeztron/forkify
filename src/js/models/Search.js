import axios from "axios";

export default class Search {
    constructor(query) {
        this.query = query;

    }

    async getResults() {
        const key = "1a832fb5a8d7dec043f06e57acc5ca13";
        try {
            const res = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            this.result = res.data.recipes;
            //console.log(this.result);
        } catch(error) {
            alert(error);
        }
    }
}

