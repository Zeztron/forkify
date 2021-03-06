import Search from "./models/Search.js";
import Recipe from "./models/Recipe.js";
import List from "./models/List.js";
import Likes from "./models/Likes.js";
import * as searchView from "./views/searchView.js";
import * as recipeView from "./views/recipeView.js";
import * as listView from "./views/listView.js";
import * as likesView from "./views/likesView.js";
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
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (err) {
            console.log(err);
            alert("Error processing recipe!");
        }
    }
};

["hashchange", "load"].forEach(event => window.addEventListener(event, controlRecipe));
// ********************************************************** //

// ***** L I S T   C O N T R O L L E R ***** //

const controlList = () => {
    // Create a new list IF there is none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// Handle delete and update list item events
elements.shopping.addEventListener("click", e => {
    const id = e.target.closest(".shopping__item").dataset.itemid;
    // Handle the delete buttons
    if (e.target.matches(".shopping__delete, .shopping__delete *")) {
        // Delete from State
        state.list.deleteItem(id);
        // Delete from UI
        listView.deleteItem(id);
    // Handle the count update
    } else if (e.target.matches(".shopping__count-value")) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

// ********************************************************** //

// ***** L I K E S   C O N T R O L L E R ***** //
const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has not yet liked current recipe
    if(!state.likes.isLiked(currentID)) {
        // Add like to the State
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like buttons
        likesView.toggleLikeBtn(true);
        // Add like to the UI list
        likesView.renderLike(newLike);
    // User has liked the current recipe
    } else {
        // Remove like from the State
        state.likes.deleteLike(currentID);
        // Toggle the like buttons
        likesView.toggleLikeBtn(false);
        // Remove like from the UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Restore liked recipes on page load
window.addEventListener("load", () => {
    state.likes = new Likes();
    // Restore likes
    state.likes.readStorage();
    // Toggle button
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


// ********************************************************** //

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
    } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
        // Add ingredients to the list
        controlList();
    } else if (e.target.matches(".recipe__love, .recipe__love *")) {
        // Like controller
        controlLike();
    }
});
















