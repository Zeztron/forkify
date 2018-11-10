import Search from "./models/Search.js";
import Recipe from "./models/Recipe.js";
import List from "./models/List.js";
import * as searchView from "./views/searchView.js";
import * as recipeView from "./views/recipeView.js";
import { elements, renderLoader, clearLoader } from "./views/base.js";

/* Global State of the app
* - Search Object
* - Current recipe Object
* - Shopping list Object
* - Liked recipes
*/

const state = {};

// ***** S E A R C H  C O N T R O L L E R ***** //

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
        try {
            // 4) Search for recipes
            await state.search.getResults();
            // 5) render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert("Something went wrong");
            clearLoader();
        }
    }
}
elements.searchForm.addEventListener("submit", e => {
    e.preventDefault();
    controlSearch();
});
elements.searchResPages.addEventListener("click", e => {
    const btn = e.target.closest(".btn-inline");
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});
// ********************************************************** //

// ***** R E C I P E   C O N T R O L L E R ***** //

const controlRecipe = async () => {
    // Get ID from the URL
    const id = window.location.hash.replace("#", "");

    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        // Highlight selected search item
        if (state.search) searchView.highlightSelected(id);
        // Create a new recipe Object
        state.recipe = new Recipe(id);
        try {
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        } catch (err) {
            console.log(err);
            alert("Error processing recipe!");
        }
    }
};

["hashchange", "load"].forEach(event => window.addEventListener(event, controlRecipe));


// Handling recipe button clicks
elements.recipe.addEventListener("click", e => {
    if (e.target.matches(".btn-decrease, .btn-decrease *")) {
        // Decrease if button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings("dec");
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches(".btn-increase, .btn-increase *")) {
        // Increase if button is clicked
        state.recipe.updateServings("inc");
        recipeView.updateServingsIngredients(state.recipe);
    }
});















