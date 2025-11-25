
async function changeLanguage(lang) { // lang = "NO", "EN", osv.
    await fetch("translations.json")
        .then(response => response.json()) // Parse JSON
        .then(data => {
            for (let id in data[lang]) {
                try {
                    let matches = document.querySelectorAll("[langid='"+id+"']")
                    matches.forEach(e => { // Add translation to all matching elements
                        e.innerHTML = data[lang][id];
                    })
                } catch {
                    // console.warn(id, data[lang][id]) // For debugging
                }
            }
        })
        .catch(error => console.error("Error fetching translations:", error));
    
    // Update all multiselect dropdowns
    for (let multiselect of document.getElementsByClassName("multiselect-dropdown")) {
        multiselect.refresh(); // Refreshes the text on the selected and shown options
        multiselect.refreshOpts(); // Refreshes the text on the options to choose (The text in the dropdown)
    }
}

async function getTableData() {
    let lang = getLang();
    let changed_lang = changeLanguage(lang);
    updateLangRadios(lang)
    
    try {
        // Set hexagon colors
        let side_counter = 0
        for (let key in QUESTIONS_DATA) {
            if (key.startsWith("Q")) {
                if (side_counter < 6) { // Hexagon has 6 sides
                    document.getElementById("hex"+side_counter).style.fill = "var(--"+QUESTIONS_DATA[key]+"_color)";
                }
                side_counter++;
            }
        }
        // Set date text
        document.getElementById("hospital_last_edited").innerText = QUESTIONS_DATA["Text"];
    } catch (err) { }

    // Get header cookies
    let cookie_list = document.cookie.split("; ")
    let search_filter_cookie = "";
    let header_cookie = [];
    let sort_cookie = "";
    for (this_cookie of cookie_list) {
        if (this_cookie.split("=")[0] == "search") {
            search_filter_cookie = this_cookie.split("=")[1];
        } 
        else if (this_cookie.split("=")[0] == "table_header") {
            header_cookie = [...this_cookie.split("=")[1].split(",")];
        }
        else if (this_cookie.split("=")[0] == "sort") {
            sort_cookie = this_cookie.split("=")[1];
        } 
    }

    // sort DATA
    if (sort_cookie != "") {
        DATA.sort((a, b) => (a[sort_cookie] > b[sort_cookie] ? 1 : -1));
    }
    
    // Set the filters to cookie filters
    document.getElementById("search_filter_inp").value = search_filter_cookie;

    // Set the header to cookie headers
    if (header_cookie.length > 0) { // (if there is a cookie)
        for (child of document.getElementById("header_choices").children) {
            if (header_cookie.includes(child.value)) {
                child.selected = true;
            } else {
                child.selected = false;
            }
        }
    }


    // Create table
    let headers = [];
    for (child of document.getElementById("header_choices").children) {
        if (child.selected) {
            headers.push(child.value);
        }
    }

    let filtered_data;
    filtered_data = update_table_filter(document.getElementById("search_filter_inp").value);
    
    await changed_lang;
    update_table_and_header(headers, filtered_data);

}

function getPersonData() {
    changeLanguage(getLang());

    function create_table(
        f_name="",
        l_name="",
        birth="",
        incident="",
        cause="",
        criticality="",
        movability="",
        arrival="",
        exp_departure="",
        departure="",
        departure_status="",
        departure_destination="",
        nationality="",
        national_id="",
        comment=""
    ) {
        change_hospital_name(HOSPITAL_NAME);

        // Sets the <input>s to existing info
        document.getElementById("arrival").value = arrival;
        document.getElementById("first_name").value = f_name;
        document.getElementById("last_name").value = l_name;
        document.getElementById("nationality").value = nationality;
        document.getElementById("national_id").value = national_id;
        document.getElementById("birth").value = birth;
        document.getElementById("incident").value = incident;
        document.getElementById("expected_departure").value = exp_departure;
        document.getElementById("departure").value = departure;
        document.getElementById("departure_destination").value = departure_destination;

        // Sets the <select>s to existing info
        document.getElementById("cause").value = cause; 
        document.getElementById("criticality").value = criticality;
        document.getElementById("movability").value = movability;
        document.getElementById("departure_status").value = departure_status;

        // Changes inputs if value exists in date-inputs
        if (arrival != "") {
            document.getElementById("arrival").className = "";
            document.getElementById("arrival_now_btn").className = "disappear";
        }
        if (exp_departure != "") {
            document.getElementById("exp_departure").className = "";
            document.getElementById("exp_departure_now_btn").className = "disappear";
        }
        if (departure != "") {
            document.getElementById("departure").className = "";
            document.getElementById("departure_now_btn").className = "disappear";
        }
        birth != "" ? document.getElementById("birth").className = "" : "";

        // Add the comment if one exists
        if (comment.replaceAll("\n", "").replaceAll(" ", "") != "") {
            document.getElementById("no_comment_cont").className = "disappear";
            document.getElementById("comment").innerText = comment;
            document.getElementById("comment").className = "";
            document.getElementById("comment_note").className = "hide";
        }
    }
    
    const query_string = window.location.search;
    const parameters = new URLSearchParams(query_string);
    let url_id = parameters.get('id');

    // Add take picture button
    if (SHOW_PICTURE_ICON) {
        document.getElementById("show_picture_btn_cont").innerHTML = `
            <div style="float: right;"><button type="button" onclick="upload_pic(event, '${url_id}', '${DATA.first_name} ${DATA.last_name}', '/detail.html')" id="details_top_btn">
                <img src="/img/picture_icon.svg" alt="Last opp bilde">
                <span langid="take_picture">Ta bilde</span>
            </button></div>
        `;
    }
    
    // creating new
    if (url_id == undefined) { 
        create_table()

        document.getElementById("dont_save_btn_text").innerText = "Forkast og gå tilbake";
    } 
    // editing existing info
    else { 
        create_table(
            DATA.first_name,
            DATA.last_name,
            DATA.birth,
            DATA.incident,
            DATA.cause,
            DATA.criticality,
            DATA.movability,
            DATA.arrival,
            DATA.expected_departure,
            DATA.departure,
            DATA.departure_status,
            DATA.departure_destination,
            DATA.nationality,
            DATA.national_id,
            DATA.comment
        );

        // Set the title
        let f_name = document.getElementById("first_name").value;
        let l_name = document.getElementById("last_name").value;
        f_name == "" && l_name == "" ? f_name = "Ukjent" : "";
        let age = document.getElementById("birth").value;
        age == "" ? age = "ukjent" : "";
        document.getElementById("name_title").innerText = f_name +" "+ l_name;

        // Add images
        let html_code = "";
        for (let picture of PICTURES) {
            html_code += `
                <tr>
                    <th><img src="`+picture.src+`" alt="" onclick="show_picture_big('`+picture.src+`')"></th>
                    <td>`+picture.comment+`</td>
                </tr>
            `;
        }
        document.getElementById("detail_pic_body").innerHTML = html_code;

    }
}

function getHospitalData() {
    let lang = getLang();
    changeLanguage(lang);

    change_hospital_name(HOSPITAL_NAME);

    const hexagon_sideID_queue = ["hexagon_top_middle", "hexagon_top_right", "hexagon_bottom_right", "hexagon_bottom_middle", "hexagon_bottom_left", "hexagon_top_left"]

    let tbody = document.getElementById("hospital_tbody");
    tbody.innerHTML = "";

    let side_counter = 0
    for (let key in QUESTIONS) {
        tbody.innerHTML += `
            <tr>
                <th>${QUESTIONS[key][lang]["question"]}</th>
                <td class="hospital_radio_cont">
                    <label>
                        <input onclick="input_changed('hospital', this)" class="hospital_question_radio" type="radio" id="${key}_radio_green" name="${key}" value="green" ${DATA[key] == "green" ? "checked" : ""} />
                        <span class="checkmark checkmark_green"></span>
                    </label>
                </td>
                <td class="hospital_radio_cont">
                    <label>
                        <input onclick="input_changed('hospital', this)" class="hospital_question_radio" type="radio" id="${key}_radio_yellow" name="${key}" value="yellow" ${DATA[key] == "yellow" ? "checked" : ""} />
                        <span class="checkmark checkmark_yellow"></span>
                    </label>
                </td>
                <td class="hospital_radio_cont">
                    <label>
                        <input onclick="input_changed('hospital', this)" class="hospital_question_radio" type="radio" id="${key}_radio_red" name="${key}" value="red" ${DATA[key] == "red" ? "checked" : ""} />
                        <span class="checkmark checkmark_red"></span>
                    </label>
                </td>
                <td class="hospital_radio_desc_cont">
                    <p id="${key}_description">${QUESTIONS[key][lang][DATA[key]]}</p>
                </td>
            </tr>
        `;

        if (side_counter < hexagon_sideID_queue.length) {
            document.getElementById(hexagon_sideID_queue[side_counter]).id = "hexagon_"+key; // New id makes it easier to reffer to this when updating color on input changed
            document.getElementById("hexagon_"+key).style.fill = "var(--"+DATA[key]+"_color)";
        }

        side_counter++;
    }
}

function getPictureData() {
    changeLanguage(getLang());

    change_hospital_name(HOSPITAL_NAME);

    const query_string = window.location.search;
    const parameters = new URLSearchParams(query_string);
    document.getElementById("name_title").innerText = parameters.get('name');

    // Send back to previous page
    let back_url = parameters.get('from') + (parameters.get('id')!=null ? "?id="+parameters.get('id') : "");
    document.getElementById("picture_back_btn").setAttribute("onclick", "send_back(true, '"+back_url+"')");
    document.getElementById("save_popup_forkast_btn").setAttribute("onclick", "send_back(false, '"+back_url+"')");
    document.getElementById("picture_from").action = parameters.get('from');

    if (parameters.get('id') != null) {
        document.getElementById("picture_from").innerHTML += `<input style="display: none;" type="text" name="id" id="id_input_autofill" value="${parameters.get('id')}"/>`;
    }
}

function accessPageLoaded() {
    changeLanguage(getLang());
    change_hospital_name(HOSPITAL_NAME);
}


function getLang() {
    let lang = getCookie("language");
    return lang != "" ? lang : "NO"; // If no language saved, use NO
}

async function setLang(lang) {
    let changed_lang = changeLanguage(lang);
    toggleLangDropdown()
    document.cookie = "language="+lang; // Save as cookie

    // Show whats currently sorted after
    await changed_lang; // Wait for translation to be done
    let sort_cookie = getCookie("sort");
    try {
        sort_cookie != "" ? document.getElementById("head_"+sort_cookie).innerHTML += "<span class='header_sorted_after'> v</span>" : "";
    } catch (error) { }
}
function updateLangRadios(lang) {
    document.getElementById("lang_"+lang).checked = true;
}




function input_changed(page, e) { //TODO? save current editing in cookie/page-storage
    // Update title if name or age was changed
    if (e.id == "first_name" || e.id == "last_name" || e.id == "birth") {
        let f_name = document.getElementById("first_name").value;
        let l_name = document.getElementById("last_name").value;
        f_name == "" && l_name == "" ? f_name = "Ukjent" : "";
        
        document.getElementById("name_title").innerText = f_name +" "+ l_name;
    }

    // Remove or show now btn
    if (e.type == "date" || e.type == "datetime-local") {
        if (e.value != "") {
            e.className = "";
            e.type == "datetime-local" ? document.getElementById(e.id + "_now_btn").className = "disappear" : "";
        } else {
            e.className = "input_date_empty";
            e.type == "datetime-local" ? document.getElementById(e.id + "_now_btn").className = "" : "";
        }
    }

    // Update question description and hexagon colors
    if (e.className == "hospital_question_radio") {
        let lang = getLang();
        document.getElementById("hexagon_" + e.name).style.fill = "var(--"+e.value+"_color)";
        document.getElementById(e.name + "_description").innerText = QUESTIONS[e.name][lang][e.value];
    }

    // Update new_data
    if (page == "detail") {
        for (key of Object.keys(new_data)) {
            if (key == "id" || key == "admitted_hospital") {
                continue;
            }
            let elem = document.getElementById(String(key));
            if (elem.nodeName == "INPUT" || elem.nodeName == "SELECT") {
                new_data[String(key)] = elem.value;
            } else if (elem.nodeName == "DIV") {
                new_data[String(key)] = elem.innerText;
            } else {
                console.error("unknown HTML node name - input_changed() - name:", elem.nodeName);
            }
        }
    } else if (page == "hospital") {
        new_data[e.name] = e.value;
    }

    // Check if table has unsaved info
    if (object_equals(DATA, new_data)) {
        document.getElementById("filter_note").className = "hide";
    } else {
        document.getElementById("filter_note").className = "show";
    }

}

// Change upload picture image
function update_img(event) {
    document.getElementById("upload_pic_img").src = URL.createObjectURL(event.target.files[0]);

    new_data.picture = true;
}


function header_choice_changed() {

    let search = document.getElementById("search_filter_inp").value;
    let filtered_data = update_table_filter(search);

    let headers = [];
    for (child of document.getElementById("header_choices").children) {
        if (child.selected) {
            headers.push(child.value);
        }
    }

    document.cookie = "table_header="+headers; // Save as cookie

    update_table_and_header(headers, filtered_data);
}

function search_filter_changed() {
    
    let search = document.getElementById("search_filter_inp").value;

    document.cookie = "search=" + search; // Save as cookie

    let filtered_data = update_table_filter(search);

    let headers = [];
    for (child of document.getElementById("header_choices").children) {
        if (child.selected) {
            headers.push(child.value);
        }
    }
    update_table_and_header(headers, filtered_data);
}


function update_table_filter(search) {

    let search_for = search.trim().toLowerCase();
    
    // Show note ("*Tabellinformasjonene er filtrert")
    if (search_for != "") {
        document.getElementById("filter_note").className = "show";
    } else {
        document.getElementById("filter_note").className = "hide";
    }

    // Filter the info
    let filtered_data = [];
    if (search_for != "") {
        for (person of DATA) {
            for (key of Object.keys(person)) {
                if (key == "num_hint") continue; // Do not allow search on num_hint
                if (person[key].toString().toLowerCase().includes(search_for)) {
                    filtered_data.push(person);
                    break;
                }
            }
        }
    } else {
        filtered_data = [...DATA];
    }

    return filtered_data;
}

async function update_table_and_header(table_headers=[], filtered_data=[], change_lang=true) { 
    let h = {
        local_id: "Lokal ID",
        first_name: "Fornavn",
        last_name: "Etternavn",
        birth: "Nasjonalitet",
        incident: "Nasjonal ID",
        cause: "Fødselsdato",
        criticality: "Ankomst",
        movability: "Hendelse",
        arrival: "Årsak",
        expected_departure: "Kritikalitet",
        departure: "Flyttbarhet",
        departure_status: "Avreise",
        departure_destination: "Forventet avreise",
        nationality: "Avreisestatus",
        national_id: "Avreisedestinasjon",
        comment: "Kommentar"
    }

    if (change_lang) {
        await fetch("translations.json")
            .then(response => response.json()) // Parse JSON
            .then(data => {
                try {
                    let lang_data = data[getLang()];
                    h = {
                        local_id: lang_data["local_id"],
                        first_name: lang_data["first_name"],
                        last_name: lang_data["last_name"],
                        birth: lang_data["birth"],
                        incident: lang_data["incident"],
                        cause: lang_data["cause"],
                        criticality: lang_data["criticality"],
                        movability: lang_data["movability"],
                        arrival: lang_data["arrival"],
                        expected_departure: lang_data["expected_departure"],
                        departure: lang_data["departure"],
                        departure_status: lang_data["departure_status"],
                        departure_destination: lang_data["departure_destination"],
                        nationality: lang_data["nationality"],
                        national_id: lang_data["national_id"],
                        comment: lang_data["comment"]
                    }
                } catch { }
            })
            .catch(error => console.error("Error fetching translations:", error));
    }

    let table_head = document.getElementById("table_head_row");
    table_head.innerHTML = "";

    // Add invisible head for suggestion exists row
    table_head.innerHTML += `<th class="nothing"> </td>`;

    for (head of table_headers) {
        table_head.innerHTML += `<th langid="`+head+`" id="head_`+head+`" onclick="sort_table('`+head+`')">`+h[head]+`</th>`;
    }

    //TODO? format fields with dates and time better
    let table_body = document.getElementById("table_body");
    table_body.innerHTML = "";
    for (person of filtered_data) {
        table_body.innerHTML += `<tr id="person_id_`+person.id+`" onclick="edit('`+person.id+`')"></tr>`;
        let row = document.getElementById("person_id_"+person.id);

        // Add suggestion_exists_icon if suggestion exists
        row.innerHTML += `<td class="suggestion_exists_column">` + (person.num_hint > 0 ? `<img src="/img/suggestion_exists_icon.svg" height="20" alt="Forslag finnes">` : "") + `</td>`;

        for (column of table_headers) {
            if (person[column] != "" && (column == "arrival" || column == "expected_departure" || column == "departure")) {
                let DTG_list = person[column].split(/[-T:]+/); // [yyyy, mm, dd, hour, min]
                row.innerHTML += `<td>DTG `+DTG_list[2]+DTG_list[3]+DTG_list[4]+`</td>`;
            } else {
                row.innerHTML += `<td>`+person[column].replace(/[\u00A0-\u9999<>\u005C\u0026\u0022\u0027]/g, i => '&#' + i.charCodeAt(0) + ';')+`</td>`;
            }
        }

        if (SHOW_PICTURE_ICON) {
            row.innerHTML += `<td class="picture_column"> <img onclick="upload_pic(event, '`+person.id+`', '`+person["first_name"]+` `+person["last_name"]+`')" src="/img/picture_icon.svg" height="35" alt="Last opp bilde"> </td>`; 
        }
        
        if (person.comment != "") {
            row.innerHTML += `<td class="comment_column"> <img onclick="show_comment(event, '`+person.comment.replaceAll("'", "&#39;").replace(/[\u00A0-\u9999<>\u005C\u0026\u0022\u0027]/g, i => '&#' + i.charCodeAt(0) + ';')+`')" src="/img/comment_filled_icon.svg" height="35" alt="Se kommentar"> </td>`; 
        }
    }

    // Show currently sorted after
    let sort_cookie = getCookie("sort");
    try {
        sort_cookie != "" ? document.getElementById("head_"+sort_cookie).innerHTML += "<span class='header_sorted_after'> v</span>" : ""; //TODO? add text that informs it is sorted
    } catch (error) {
        console.log("err");
        //TODO? do something if the category sorted after is not shown
    }

}


function toggleLangDropdown() {
    let lang_labels = document.getElementsByClassName("lang_radio_label");

    for (let lang_label of lang_labels) {
        lang_label.classList.toggle("fold_in");
    }
}

function make_new(from_pic=false) {
    window.location.href = "/detail.html"+(from_pic ? "?fromphoto=yes" : "");
}

function edit(id) {
    window.location.href = "/detail.html?id="+id;
}

function send_back(check_for_changes=false, destination="/overview.html") {
    if (!check_for_changes || object_equals(DATA, new_data)) {
        window.location.href = destination;
    } else {
        document.getElementById("save_popup_center").className = "display_flex";
    }
}


function upload_pic(event, id, name, from_url="/overview.html") {
    window.location.href = `/upload_picture.html?${id == null || id == "null" || id == "" ? "" : "id="+id+"&"}name=${name}&from=${from_url}`;

    dont_do_parent_event(event); // Stops the edit() onclick event that would have triggered
}


function add_comment() {
    document.getElementById("no_comment_cont").className = "disappear";

    document.getElementById("comment").className = "";
    document.getElementById("comment_note").className = "hide";
}

function close_comment() {
    document.getElementById("no_comment_cont").className = "";

    document.getElementById("comment").className = "disappear";
    document.getElementById("comment_note").className = "disappear";
}

function show_comment(event, comment) {
    document.getElementById("overview_comment").innerText = comment.replaceAll("&#39;", "'");
    document.getElementById("show_comment_full_page").className = "display_flex";
    dont_do_parent_event(event); // Stops the edit() onclick event that would have triggered
}

function hide_comment() {
    document.getElementById("show_comment_full_page").className = "disappear";
}


function toggleDiv(divname) {
    var div = document.getElementById(divname);
    if (div.style.display === "none") {
        div.style.display = "block";
    } else {
        div.style.display = "none";
    }
}


function swap_picture_mode() {
    let select_value = document.getElementById("take_picture_select").value;

    if (select_value == "gallery") {
        document.getElementById("upload_pic_inp").removeAttribute("capture");
    } else if (select_value == "picture") {
        document.getElementById("upload_pic_inp").setAttribute("capture", "environment");
    }
}


function show_picture_big(src) {
    document.getElementById("picture_big").src = src
    document.getElementById("show_picture_full_page").className = "display_flex";
}

function hide_picture_big() {
    document.getElementById("show_picture_full_page").className = "disappear";
}

let currentZoom = 1;
let minZoom = 1;
let maxZoom = 3;
let stepSize = 0.1;
function zoom_image(direction) {

    let newZoom = currentZoom + direction * stepSize;

    // Limit the zoom level to the minimum and maximum
    // values
    if (newZoom < minZoom || newZoom > maxZoom) {
        return;
    }

    currentZoom = newZoom;

    // Update the CSS transform of the image to scale it
    let image = document.getElementById("picture_big");
    image.style.transform = "scale(" + currentZoom + ")";
}


function hide_save_popup() {
    document.getElementById("save_popup_center").className = "disappear";
}


function dont_do_parent_event(event) {
    event.stopPropagation();
}

function validate_email(e) {
    let expr = /^[\w-\.]+@([\w-]+\.)+[\w-]+$/;

    if (!expr.test(e.value)) {
        document.getElementById("email_note").className = "show";
    }

    return expr.test(e.value);
}

function erase_email_error() {
    if (document.getElementById("email_note").className == "show") {
        document.getElementById("email_note").className = "hide";
    }
}

function set_date_to_now(id) {
    let date = new Date();
    let dd = String(date.getDate()).padStart(2,"0");
    let mm = String(date.getMonth()+1).padStart(2,"0");
    let yyyy = date.getFullYear();
    let time = String(date.getHours()).padStart(2,"0")+":"+String(date.getMinutes()).padStart(2,"0");

    document.getElementById(id).value = yyyy+"-"+mm+"-"+dd+"T"+time;
    input_changed('detail',document.getElementById(id));
}

function toggle_departure_status_menu(ds_select_id) {
    let dsm_center = document.getElementById(ds_select_id + "_menu_center");
    dsm_center.classList.toggle("disappear");
}

function select_departure_status(select_id, option) {
    let select = document.getElementById(select_id);
    select.value = option;

    toggle_departure_status_menu(select_id);
}

function sort_table(category) {
    // Sort DATA
    DATA.sort((a, b) => (a[category] >= b[category] ? 1 : -1));
    document.cookie = "sort="+category; // Save as cookie

    // Update table
    let search = document.getElementById("search_filter_inp").value;
    let filtered_data = update_table_filter(search);

    let headers = [];
    for (child of document.getElementById("header_choices").children) {
        if (child.selected) {
            headers.push(child.value);
        }
    }

    update_table_and_header(headers, filtered_data);
}


function change_hospital_name(name) {
    document.getElementById("hospital_location").innerText = name;
}


function copy_content() {
    document.getElementById("comment_data").value = document.getElementById("comment").innerText;
}

function no_enter_submit(event) {
    if (event.keyCode === 13) {
        return false;
    }
}



function getCookie(name) {
    let cookie_list = document.cookie.split("; ");
    let chosen_cookie = "";
    for (this_cookie of cookie_list) {
        if (this_cookie.split("=")[0] == name) {
            chosen_cookie = this_cookie.split("=")[1];
        } 
    }
    return chosen_cookie
}

function object_equals(obj1, obj2) {
    if (Object.keys(obj1).length != Object.keys(obj2).length) {
        return false;
    }

    try {
        for (key of Object.keys(obj1)) {
            if (obj1[key] != obj2[key]) {
                return false;
            }
        }
    } catch (err) {
        return false;
    }

    return true; // If all keys match and they are the same length
}


// Under is from stack overflow: https://stackoverflow.com/questions/1125292/how-to-move-the-cursor-to-the-end-of-a-contenteditable-entity
function setEndOfContenteditable(contentEditableElement) {
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection)//IE 8 and lower
    { 
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
}

