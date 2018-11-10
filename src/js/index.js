import Search from "./models/Search.js";
import * as searchView from "./views/searchView.js";
import { elements, renderLoader, clearLoader } from "./views/base.js";

/* Global State of the app
* - Search Object
* - Current recipe Object
* - Shopping list Object
* - Liked recipes
*/

const state = {};

const controlSearch = async () => {
    // 1) Get query form view
    const query = searchView.getInput();
    if (query) {
        // 2) new search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        // 4) Search for recipes
        await state.search.getResults();

        // 5) render results on UI
        clearLoader();
        searchView.renderResults(state.search.result);
    }
}

elements.searchForm.addEventListener("submit", e => {
    e.preventDefault();
    controlSearch();
});



// first API key: 1a832fb5a8d7dec043f06e57acc5ca13
// Second API key: 9062950ff6364dd28553e8900f0c2a31
// Third API key: c23cf38b29d6b2503e6e1de60bd0044d
// Fourth API key: b58927e43a9759e8364a7373dcec2a72
// Search: https://www.food2fork.com/api/search
// Recipe: https://www.food2fork.com/api/get