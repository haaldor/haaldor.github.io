// ===== SITE PRE-EXISTING EVENT LISTENERS ========================================================
document.querySelector('#sidebar-l>button').addEventListener('click', (e) => add_member());
document.querySelector('#sidebar-r>button').addEventListener('click', (e) => add_split());
document.querySelector('#main>main>button').addEventListener('click', (e) => add_product());

document.querySelector('#main #clear-recipt-button').addEventListener('click', (e) => remove_all_products());
document.querySelector('#main #download-recipt-button').addEventListener('click', (e) => download_recipt());
document.querySelector('#main #upload-recipt-button>input').addEventListener('change', (e) => upload_recipt());

document.querySelector('#save-load-button').addEventListener('click', (e) => {
    save_setup();
    document.querySelector('#load-input').value = '';
    document.querySelector('.popup').toggleAttribute('visible', true);
});

document.querySelectorAll('.popup').forEach((element) => {
    element.addEventListener('click', (e) => {
        if(e.offsetX > element.offsetWidth || e.offsetX < 0 || e.offsetY > element.offsetHeight || e.offsetY < 0) {
            element.toggleAttribute('visible', false);
        }
    });
    element.querySelector('.close-button').addEventListener('click', (e) => {
        element.toggleAttribute('visible', false);
    });
});

document.querySelector('#popup-setup-load>.load-button').addEventListener('click', (e) => load_setup());




// when site is loaded load recipt from cookie

window.addEventListener('load', (e) => {
    _load_setup_from_cookie();
});
window.addEventListener("beforeunload", (e) => {
    save_setup()
 });

// ===== ADDING FIELDS TO SECTIONS ================================================================
function add_member(name = '') {
    var element = document.querySelector('#sidebar-l');
    var clone = element.querySelector('template').content.cloneNode(true);

    clone.querySelector('input').value = name;

    clone.querySelector('button').addEventListener('click', (e) => {
        element.removeChild(e.currentTarget.closest('#sidebar-l>div'));
        update_all_sliders();
    });

    clone.querySelector('input').addEventListener('input', (e) => {
        update_all_sliders();
    });

    element.insertBefore(clone, element.lastElementChild);
    update_all_sliders();
}
function remove_all_members() {
    var element = document.querySelector('#sidebar-l');
    element.querySelectorAll(':scope>div').forEach((child) => {
        element.removeChild(child);
    });
    update_all_sliders();
}

function add_split(name = '') {
    var element = document.querySelector('#sidebar-r');
    var clone = element.querySelector('template').content.cloneNode(true);

    clone.querySelector('input[splitname]').value = name;
    clone.querySelector('div').setAttribute('name', name);

    _update_sliders(clone);

    clone.querySelector('button').addEventListener('click', (e) => {
        element.removeChild(e.currentTarget.closest('#sidebar-r>div'));
        update_all_selects();
    });

    clone.querySelector('input[splitname]').addEventListener('input', (e) => {
        update_all_selects();
        e.currentTarget.closest('div').setAttribute('name', e.currentTarget.value);
    });

    element.insertBefore(clone, element.lastElementChild);
    update_all_selects()
}
function remove_all_splits() {
    var element = document.querySelector('#sidebar-r');
    element.querySelectorAll(':scope>div').forEach((child) => {
        element.removeChild(child);
    });
    update_all_selects();
}

function add_product(name = '', type='', value = '') {
    var element = document.querySelector('#product-list');
    var clone = element.querySelector('template').content.cloneNode(true);

    _update_select(clone.querySelector('select'));

    if(name) clone.querySelector('input[productname]').value = name;
    if(type) clone.querySelector('select').value = type;
    if(value) clone.querySelector('input[type=number]').value = value;

    clone.querySelector('button').addEventListener('click', (e) => {
        element.removeChild(e.currentTarget.closest('main>div'));
        update_calculated_sums();
    });

    clone.querySelector('input[type=number]').addEventListener('input', (e) => {
        update_calculated_sums();
    });
    clone.querySelector('select').addEventListener('change', (e) => {
        update_calculated_sums();
    });

    element.querySelector('button').after(clone);
}
function remove_all_products() {
    var element = document.querySelector('#product-list');
    while(element.children.length>2) element.removeChild(element.lastElementChild);
}


// ===== SLIDERS UPDATING =========================================================================
function update_all_sliders() {
    document.querySelectorAll('#sidebar-r>div').forEach((child) => {
        _update_sliders(child);
    });
    update_calculated_members();
    check_member_overlay();
}

function _update_sliders(element) {
    function addRangeBar(name, initial_level = 0, initial_locked = false) {
        var clone = element.querySelector('.template-single-range').content.cloneNode(true);

        clone.querySelector('div').setAttribute('name', name);
        clone.querySelector('span[slidername]').innerText = name;

        clone.querySelector('input').value = initial_level;
        clone.querySelector('span:last-child').innerText = initial_level + '%';

        if(initial_locked) {
            clone.querySelector('div').toggleAttribute('locked');
            clone.querySelector('input').disabled = true;
        }

        clone.querySelector('input').addEventListener('input', (e) => {
            // change other sliders to sum to 100
            var unlockedInputs = [];
            var targetSum = 100;

            var currentValue = parseInt(e.currentTarget.value);


            e.currentTarget.closest('#sidebar-r>div').querySelectorAll('.range-list>div').forEach((child) => {
                if(child.querySelector('span:last-child').hasAttribute('locked') || child.querySelector('input') === e.currentTarget) {
                    targetSum -= child.querySelector('input').value; 
                } else {
                    unlockedInputs.push(child.querySelector('input'));
                }
            });

            if(targetSum < 0) {
                currentValue = currentValue + targetSum;
                targetSum = 0;
            }
            for(child of unlockedInputs) {
                child.value = Math.floor(targetSum/unlockedInputs.length)
            }

            if(unlockedInputs.length > 0) currentValue = targetSum + currentValue - unlockedInputs.length * Math.floor(targetSum/unlockedInputs.length);
            else currentValue = 0;

            e.currentTarget.value = currentValue;

            // update text of all inputs
            e.currentTarget.closest('#sidebar-r>div').querySelectorAll('.range-list>div').forEach((child) => {
                child.querySelector('span:last-child').innerText = child.querySelector('input').value + '%';
            });
            
            update_calculated_sums();
        });

        clone.querySelector('span:last-child').addEventListener('click', (e) => {
            //lock the range bar
            e.currentTarget.toggleAttribute('locked');
            e.currentTarget.parentElement.querySelector('input').disabled = e.currentTarget.hasAttribute('locked');
        });

        element.querySelector('.range-list').appendChild(clone);
    }

    var oldBars = {};
    element.querySelectorAll('.range-list>div').forEach((child) => {
        oldBars[child.getAttribute('name')] = {
            "value": child.querySelector('input').value,
            "locked": child.hasAttribute('locked')
        }
        child.parentElement.removeChild(child);
    });

    document.querySelectorAll('#sidebar-l input').forEach((child) => {
        if(child.value in oldBars) addRangeBar(child.value, oldBars[child.value].value, oldBars[child.value].locked);
        else addRangeBar(child.value);
    });
}


// ===== SELECT UPDATING ==========================================================================
function update_all_selects() {
    document.querySelectorAll('#product-list select').forEach((child) => {
        _update_select(child);
    });
    check_split_overlay();
}

function _update_select(element) {
    var selected_option = element.value;

    while(element.children.length>1) element.removeChild(element.lastElementChild);

    document.querySelectorAll('#sidebar-r>div>input').forEach((child) => {
        var newOption = document.createElement('option');
        newOption.innerText = child.value;
        newOption.value = child.value;
        element.appendChild(newOption);
    });

    element.value = selected_option;
    if(element.selectedIndex<0) element.selectedIndex = 0;
}


// ===== MEMBER SUMS UPDATING =====================================================================
function update_calculated_members() {
    var container = document.querySelector('#member-sums-list');
    var template = document.querySelector('#member-sums-list>template').content;

    //delete old members
    while(container.children.length>1) container.removeChild(container.lastElementChild);

    //add all memebers
    document.querySelectorAll('#sidebar-l>div input').forEach((child) => {
        var copy = template.cloneNode(true);

        var newText = (child.value=="" ? '-' : child.value);

        copy.querySelector('span').innerText = newText;
        copy.querySelector('div').setAttribute('name', newText);

        container.appendChild(copy);
    });

    update_calculated_sums();
}

function update_calculated_sums() {
    document.querySelectorAll('#member-sums-list>div>span:last-child').forEach((child) => {
        child.innerText = 0;
    });

    document.querySelectorAll('#product-list>div').forEach((child) => {
        document.querySelectorAll('#sidebar-r div[name=' + child.querySelector('select').value + '] .range-list>div').forEach((singleSlider) => {
            if(singleSlider.getAttribute('name')) {
                var member_sum_span = document.querySelector('#member-sums-list>div[name=' + singleSlider.getAttribute('name') + ']>span:last-child');
                member_sum_span.innerText = parseFloat(member_sum_span.innerText) + parseFloat(child.querySelector('input[type=number]').value * singleSlider.querySelector('input').value/100);
            }
        });
    });
}


// ===== CHECKING IF OVERLAYS SHOULD BE DISPLAYED =================================================
function check_member_overlay() {
    var overlay_visible = false;
    var used_names = [];

    document.querySelectorAll('#sidebar-l input').forEach((child) => {
        if(child.value == '' || used_names.includes(child.value)) overlay_visible = true;
        used_names.push(child.value);
    });

    document.querySelector('body').toggleAttribute('unnamed-members', overlay_visible);
}
function check_split_overlay() {
    var overlay_visible = false;
    var used_names = [];

    document.querySelectorAll('#sidebar-r input[splitname]').forEach((child) => {
        if(child.value == '' || used_names.includes(child.value)) overlay_visible = true;
        used_names.push(child.value);
    });

    document.querySelector('body').toggleAttribute('unnamed-splits', overlay_visible);
}


// ===== SAVING AND LOADING SETUP AND RECIPTS =====================================================
function save_setup() {
    var save_dict = {};
    document.querySelectorAll('#sidebar-r>div[name]').forEach((child) => {
        var tmp_name = child.getAttribute('name');
        save_dict[tmp_name] = {};
        child.querySelectorAll('.range-list>div').forEach((singleSlider) => {
            save_dict[tmp_name][singleSlider.getAttribute('name')] = singleSlider.querySelector('input[type=range]').value;
        });
    });

    var save_text = JSON.stringify(save_dict);
    console.log('CURRENT SPLIT SETUP SAVE:');
    console.log(save_text);

    document.querySelector('#save-textarea').innerText = save_text;
    document.cookie = "reciptsplitter_setup="+save_text+"; expires=Thu, 31 Dec 2222 00:00:00 UTC";
}

function load_setup(setup = "") {
    var load_dict = JSON.parse((setup ? setup : document.querySelector('#load-input').value));
    console.log('LOADING SPLIT SAVE:');
    console.log(load_dict);

    remove_all_splits();
    remove_all_members();

    for(splitName in load_dict) {
        add_split(splitName);
        for(memberName in load_dict[splitName]) {
            var memberSlider = document.querySelector('#sidebar-r>div[name='+splitName+'] .range-list>div[name='+memberName+']');
            if(!memberSlider) {
                add_member(memberName);
                memberSlider = document.querySelector('#sidebar-r>div[name='+splitName+'] .range-list>div[name='+memberName+']');
                console.log(memberSlider);
            }
            memberSlider.querySelector('input[type=range]').value = load_dict[splitName][memberName];
        }
    }

    update_all_sliders();

    document.querySelector('#popup-setup-load').toggleAttribute('visible', false);
}

function _load_setup_from_cookie() {
    var setup_text = document.cookie.replace('reciptsplitter_setup=', '');
    load_setup(setup_text);
}

function download_recipt() {
    var recipt_tab = [];
    document.querySelectorAll('#product-list>div').forEach((sinlgeProduct) => {
        recipt_tab.push([
            sinlgeProduct.querySelector('input[productname]').value, 
            sinlgeProduct.querySelector('select').value,
            parseFloat(sinlgeProduct.querySelector('input[type=number]').value)
        ]);
    });

    download_array_as_csv('RS_recipt', recipt_tab);
}

function upload_recipt() {
    var recipt_tab;
    var file_reader = new FileReader();

    remove_all_products();
    
    file_reader.addEventListener('load', () => {
        var file_text = file_reader.result;
        file_text = file_text.split('\n').join(',');
        recipt_tab = CSVtoArray(file_text);
        
        for(var i=2; i<recipt_tab.length; i+=3) add_product(recipt_tab[i-2], recipt_tab[i-1], recipt_tab[i]);
    });

    file_reader.readAsText(document.querySelector('#upload-recipt-button>input').files[0]);
}



// ===== EXTERNAL, GENERAL FUNCTIONS ==============================================================
function download_array_as_csv(filename, arr) {
    //function based and semi-copied from xavier-john's design
    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = '';
    for (row of arr) {
        csvFile += processRow(row);
    }

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement("a");
    var url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function CSVtoArray(text) {
    //function by ridgerunner. I'm not even gonna try to understand what exactly this regex is doing.
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;
    var a = [];                     // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function(m0, m1, m2, m3) {
            // Remove backslash from \' in single quoted values.
            if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });
    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
};