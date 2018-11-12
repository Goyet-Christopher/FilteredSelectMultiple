var FSM = {
    cache: {},
    init: function(id) {
        console.log("init("+id+")");
        var box = $id(id);
        var node;
        FSM.cache[id] = [];
        var cache = FSM.cache[id];
        var boxOptions = box.options;
        var boxOptionsLength = boxOptions.length;
        for (var i = 0, j = boxOptionsLength; i < j; i++) {
            node = boxOptions[i];
            cache.push({value: node.value, text: node.text, displayed: 1});
        }
    },
    redisplay: function(id) {
        // Repopulate HTML select box from cache
        var box = document.getElementById(id);
        var node;
        box.innerHTML=""; // clear all options
        var new_options = box.outerHTML.slice(0, -9);  // grab just the opening tag
        var cache = FSM.cache[id];
        for (var i = 0, j = cache.length; i < j; i++) {
            node = cache[i];
            if (node.displayed) {
                var new_option = new Option(node.text, node.value, false, false);
                // Shows a tooltip when hovering over the option
                new_option.setAttribute("title", node.text);
                new_options += new_option.outerHTML;
            }
        }
        new_options += '</select>';
        box.outerHTML = new_options;
    },
    filter: function(id, text) {
        // Redisplay the HTML select box, displaying only the choices containing ALL
        // the words in text. (It's an AND search.)
        var tokens = text.toLowerCase().split(/\s+/);
        var node, token;
        var cache = FSM.cache[id];
        for (var i = 0, j = cache.length; i < j; i++) {
            node = cache[i];
            node.displayed = 1;
            var node_text = node.text.toLowerCase();
            var numTokens = tokens.length;
            for (var k = 0; k < numTokens; k++) {
                token = tokens[k];
                if (node_text.indexOf(token) === -1) {
                    node.displayed = 0;
                    break;  // Once the first token isn't found we're done
                }
            }
        }
        FSM.redisplay(id);
    },
    delete_from_cache: function(id, value) {
        var node, delete_index = null;
        var cache = FSM.cache[id];
        for (var i = 0, j = cache.length; i < j; i++) {
            node = cache[i];
            if (node.value === value) {
                delete_index = i;
                break;
            }
        }
        cache.splice(delete_index, 1);
    },
    add_to_cache: function(id, option) {
        FSM.cache[id].push({value: option.value, text: option.text, displayed: 1});
    },
    cache_contains: function(id, value) {
        console.log("cache_contains = id:"+id+", value:"+value);
        // Check if an item is contained in the cache
        var node;
        var cache = FSM.cache[id];
        console.log("cache="+cache);
        for (var i = 0, j = cache.length; i < j; i++) {
            node = cache[i];
            if (node.value === value) {
                return true;
            }
        }
        return false;
    },
    move: function(from, to) {
        var from_box = document.getElementById(from);
        var option;
        var boxOptions = from_box.options;
        var boxOptionsLength = boxOptions.length;
        for (var i = 0, j = boxOptionsLength; i < j; i++) {
            option = boxOptions[i];
            var option_value = option.value;
            if (option.selected && FSM.cache_contains(from, option_value)) {
                FSM.add_to_cache(to, {value: option_value, text: option.text, displayed: 1});
                FSM.delete_from_cache(from, option_value);
            }
        }
        FSM.redisplay(from);
        FSM.redisplay(to);
    },
    move_all: function(from, to) {
        var from_box = document.getElementById(from);
        var option;
        var boxOptions = from_box.options;
        var boxOptionsLength = boxOptions.length;
        for (var i = 0, j = boxOptionsLength; i < j; i++) {
            option = boxOptions[i];
            var option_value = option.value;
            if (FSM.cache_contains(from, option_value)) {
                FSM.add_to_cache(to, {value: option_value, text: option.text, displayed: 1});
                FSM.delete_from_cache(from, option_value);
            }
        }
        FSM.redisplay(from);
        FSM.redisplay(to);
    },
    sort: function(id) {
        FSM.cache[id].sort(function(a, b) {
            a = a.text.toLowerCase();
            b = b.text.toLowerCase();
            try {
                if (a > b) {
                    return 1;
                }
                if (a < b) {
                    return -1;
                }
            }
            catch (e) {
                // silently fail on IE 'unknown' exception
            }
            return 0;
        } );
    },
    select_all: function(id) {
        var box = document.getElementById(id);
        var boxOptions = box.options;
        var boxOptionsLength = boxOptions.length;
        for (var i = 0; i < boxOptionsLength; i++) {
            boxOptions[i].selected = 'selected';
        }
    },
    any_selected: function(field) {
        var any_selected = false;
        any_selected = (field.selectedOptions.length > 0);
        return any_selected;
    },
    refresh_icons: function(field_id) {
        var from = $id(field_id + '_from');
        var to = $id(field_id + '_to');
        // Active if at least one item is selected
        $id(field_id + '_add_link').classList.toggle('active', FSM.any_selected(from));
        $id(field_id + '_remove_link').classList.toggle('active', FSM.any_selected(to));
        // Active if the corresponding box isn't empty
        $id(field_id + '_add_all_link').classList.toggle('active', from.options.length > 0);
        $id(field_id + '_remove_all_link').classList.toggle('active', to.options.length > 0);
    },
//     move_selection: function(e, elem, move_func, from, to) {
//         if (elem.className.indexOf('active') !== -1) {
//             move_func(from, to);
//             FSM.refresh_icons(field_id);
//         }
//         e.preventDefault();
//     },
    filter_key_press: function(event, field_id) {
        var from = document.getElementById(field_id + '_from');
        // don't submit form if user pressed Enter
        if ((event.which && event.which === 13) || (event.keyCode && event.keyCode === 13)) {
            from.selectedIndex = 0;
            FSM.move(field_id + '_from', field_id + '_to');
            from.selectedIndex = 0;
            event.preventDefault();
            return false;
        }
    },
    filter_key_up: function(event, field_id) {
        var from = document.getElementById(field_id + '_from');
        var temp = from.selectedIndex;
        FSM.filter(field_id + '_from', document.getElementById(field_id + '_input').value);
        from.selectedIndex = temp;
        return true;
    },
    filter_key_down: function(event, field_id) {
        var from = document.getElementById(field_id + '_from');
        // right arrow -- move across
        if ((event.which && event.which === 39) || (event.keyCode && event.keyCode === 39)) {
            var old_index = from.selectedIndex;
            FSM.move(field_id + '_from', field_id + '_to');
            from.selectedIndex = (old_index === from.length) ? from.length - 1 : old_index;
            return false;
        }
        // down arrow -- wrap around
        if ((event.which && event.which === 40) || (event.keyCode && event.keyCode === 40)) {
            from.selectedIndex = (from.length === from.selectedIndex + 1) ? 0 : from.selectedIndex + 1;
        }
        // up arrow -- wrap around
        if ((event.which && event.which === 38) || (event.keyCode && event.keyCode === 38)) {
            from.selectedIndex = (from.selectedIndex === 0) ? from.length - 1 : from.selectedIndex - 1;
        }
        return true;
    },
    addEventListener: function(field_id, is_stacked){
        // Set up the JavaScript event handlers for the select box filter interface
        var move_selection = function(e, elem, move_func, from, to) {
            if (elem.className.indexOf('active') !== -1) {
                move_func(from, to);
                FSM.refresh_icons(field_id);
            }
            e.preventDefault();
        };
        $id(field_id+"_add_all_link").addEventListener('click', function(e) {
    	    e.preventDefault();
            move_selection(e, this, FSM.move_all, field_id + '_from', field_id + '_to');
        });
        $id(field_id+"_add_link").addEventListener('click', function(e) {
            e.preventDefault();
            move_selection(e, this, FSM.move, field_id + '_from', field_id + '_to');
        });
        $id(field_id+"_remove_link").addEventListener('click', function(e) {
            e.preventDefault();
            move_selection(e, this, FSM.move, field_id + '_to', field_id + '_from');
        });
        $id(field_id+"_remove_all_link").addEventListener('click', function(e) {
            e.preventDefault();
            move_selection(e, this, FSM.move_all, field_id + '_to', field_id + '_from');
        });
        filter_input = $id(field_id+"_input")
        filter_input.addEventListener('keypress', function(e) {
            FSM.filter_key_press(e, field_id);
        });
        filter_input.addEventListener('keyup', function(e) {
            FSM.filter_key_up(e, field_id);
        });
        filter_input.addEventListener('keydown', function(e) {
            FSM.filter_key_down(e, field_id);
        });
        selector_div = $id(field_id+"_divselector");
        selector_div.addEventListener('change', function(e) {
            if (e.target.tagName === 'SELECT') {
                FSM.refresh_icons(field_id);
            }
        });
        selector_div.addEventListener('dblclick', function(e) {
            if (e.target.tagName === 'OPTION') {
                if (e.target.closest('select').id === field_id + '_to') {
                    FSM.move(field_id + '_to', field_id + '_from');
                } else {
                    FSM.move(field_id + '_from', field_id + '_to');
                }
                FSM.refresh_icons(field_id);
            }
        });
        findForm($id(field_id + '_from')).addEventListener('submit', function() {
            FSM.select_all(field_id + '_to');
        });
        FSM.init(field_id + '_from');
        FSM.init(field_id + '_to');
        // Move selected from_box options to to_box
        FSM.move(field_id + '_from', field_id + '_to');
        console.log("is_stacked ?");
        if (!is_stacked) {
            console.log("yes");
            // In horizontal mode, give the same height to the two boxes.
            var j_from_box = $id(field_id + '_from');
            var j_to_box = $id(field_id + '_to');
            var resize_filters = function() { 
                j_to_box.setAttribute("style", "height:"+($id(field_id+"_filter").offsetHeight+j_from_box.offsetHeight)+"px" ); 
            };
            if (j_from_box.offsetHeight > 0) {
                console.log("outerHeight > 0");
                resize_filters(); // This fieldset is already open. Resize now.
            } else {
                console.log("outerHeight <= 0");
                // This fieldset is probably collapsed. Wait for its 'show' event.
                j_to_box.closest('fieldset').one('show.fieldset', resize_filters);
            }
        }else{
            console.log("no");
        }
    
        // Initial icon refresh
        FSM.refresh_icons(field_id);
    }
};
window.FSM = FSM;

function $id(id) {
	return document.getElementById(id);
}

function findForm(node) {
    // returns the node of the form containing the given node
    if (node.tagName.toLowerCase() !== 'form') {
        return findForm(node.parentNode);
    }
    return node;
}

function init_myFilteredSelectMultiple(){
    console.log("init_myFilteredSelectMultiple");
    var x = document.getElementsByName("selector");
    for (var i = 0; i < x.length; i++) {
        widget_id = x[i].id.match(/(.*)_divselector/)[1];
        console.log(widget_id);
        FSM.addEventListener(widget_id, parseInt($id(widget_id+"_from").getAttribute("data-is-stacked"), 10) );
    } 
}
window.addEventListener('load', init_myFilteredSelectMultiple);
