
function getTableData() {
    
    change_hospital_name(HOSPITAL_NAME);

    let cookie_list = document.cookie.split("; ")
    let filter_cookie = "all";
    let header_cookie = [];
    let sort_cookie = "";
    for (this_cookie of cookie_list) {
        if (this_cookie.split("=")[0] == "filter") {
            filter_cookie = this_cookie.split("=")[1];
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
    document.getElementById("is_present").checked = (filter_cookie == "is_present");
    document.getElementById("all").checked = (filter_cookie == "all");
    document.getElementById("has_left").checked = (filter_cookie == "has_left");

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
    filtered_data = update_table_filter(document.getElementById("is_present").checked, document.getElementById("all").checked, document.getElementById("has_left").checked);
    
    update_table_and_header(headers, filtered_data);

}

function getPersonData() {
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
    
    let url_info = window.location.href.split("?")[1];
    
    if (url_info == undefined) { // creating new
        create_table()

        document.getElementById("dont_save_btn_text").innerText = "Forkast og gå tilbake";
    } 
    else { // editing existing info
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

    }
}

function getHospitalData() {
    let tbody = document.getElementById("hospital_tbody");
    tbody.innerHTML = "";
    for (let key in QUESTIONS) {
        tbody.innerHTML += `
            <tr>
                <th>${QUESTIONS[key]["question"]}</th>
                <td>
                    <div class="hospital_radio_cont">
                        <label>
                            <input onclick="input_changed('hospital', this)" class="hospital_question_radio" type="radio" id="${key}_radio_green" name="${key}_inputs" value="green" ${DATA[key] == "green" ? "checked" : ""} />
                            <span class="checkmark checkmark_green"></span>
                        </label>
                    
                        <label>
                            <input onclick="input_changed('hospital', this)" class="hospital_question_radio" type="radio" id="${key}_radio_yellow" name="${key}_inputs" value="yellow" ${DATA[key] == "yellow" ? "checked" : ""} />
                            <span class="checkmark checkmark_yellow"></span>
                        </label>
                    
                        <label>
                            <input onclick="input_changed('hospital', this)" class="hospital_question_radio" type="radio" id="${key}_radio_red" name="${key}_inputs" value="red" ${DATA[key] == "red" ? "checked" : ""} />
                            <span class="checkmark checkmark_red"></span>
                        </label>
                    </div>
                    <p><span class="hospital_radio_desc_color">></span> <span id="${key}_description">${QUESTIONS[key][DATA[key]]}</span></p>
                </td>
            </tr>
        `;
    }
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

    // Update question description
    if (e.class = "hospital_question_radio") {
        let Q_nr = e.name.replace("_inputs", "");

        document.getElementById(Q_nr + "_description").innerText = QUESTIONS[Q_nr][e.value];
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
        let Q_nr = e.name.replace("_inputs", "");
        new_data[Q_nr] = e.value;
    }

    // Check if table has unsaved info
    if (object_equals(DATA, new_data)) {
        document.getElementById("filter_note").className = "hide";
    } else {
        document.getElementById("filter_note").className = "show";
    }

}


function filter_changed() {
    
    let is_present = document.getElementById("is_present").checked;
    let all = document.getElementById("all").checked;
    let has_left = document.getElementById("has_left").checked;

    document.cookie = "filter="+ (is_present ? "is_present" : has_left ? "has_left" : "all"); // Save as cookie

    let filtered_data = update_table_filter(is_present, all, has_left);

    let headers = [];
    for (child of document.getElementById("header_choices").children) {
        if (child.selected) {
            headers.push(child.value);
        }
    }
    update_table_and_header(headers, filtered_data);
}

function header_choice_changed() {
    let is_present = document.getElementById("is_present").checked;
    let all = document.getElementById("all").checked;
    let has_left = document.getElementById("has_left").checked;

    let filtered_data = update_table_filter(is_present, all, has_left);

    let headers = [];
    for (child of document.getElementById("header_choices").children) {
        if (child.selected) {
            headers.push(child.value);
        }
    }

    document.cookie = "table_header="+headers; // Save as cookie

    update_table_and_header(headers, filtered_data);

}


function update_table_filter(is_present, all, has_left) {
    
    // Show note ("*Tabellinformasjonene er filtrert")
    if (is_present || has_left) {
        document.getElementById("filter_note").className = "show";
    } else {
        document.getElementById("filter_note").className = "hide";
    }

    // Filter the info
    let filtered_data = [];
    if (!all) {
        for (person of DATA) {
            if (is_present && person.departure == "") { // Has not departed
                filtered_data.push(person);
            } else if (has_left && person.departure != "") { // Has departed
                filtered_data.push(person);
            }
        }
    } else {
        filtered_data = [...DATA];
    }

    return filtered_data;
}

function update_table_and_header(table_headers=[],filtered_data=[]) { 
    let h = {
        first_name: "Fornavn",
        last_name: "Etternavn",
        birth: "Fødselsdato",
        incident: "Hendelse",
        cause: "Årsak",
        criticality: "Kritikalitet",
        movability: "Flyttbarhet",
        arrival: "Ankomst",
        expected_departure: "Forventet avreise",
        departure: "Avreise",
        departure_status: "Avreisestatus",
        departure_destination: "Avreisedestinasjon",
        nationality: "Nasjonalitet",
        national_id: "Nasjonal ID",
        comment: "Kommentar"
    }

    let table_head = document.getElementById("table_head_row");
    table_head.innerHTML = "";
    for (head of table_headers) {
        table_head.innerHTML += `<th id="head_`+head+`" onclick="sort_table('`+head+`')">`+h[head]+`</th>`;
    }

    //TODO? format fields with dates and time better
    let table_body = document.getElementById("table_body");
    table_body.innerHTML = "";
    for (person of filtered_data) {
        table_body.innerHTML += `<tr id="person_id_`+person.id+`" onclick="edit('`+person.id+`')"></tr>`;
        let row = document.getElementById("person_id_"+person.id);
        for (column of table_headers) {
            if (person[column] != "" && (column == "arrival" || column == "expected_departure" || column == "departure")) {
                let DTG_list = person[column].split(/[-T:]+/); // [yyyy, mm, dd, hour, min]
                row.innerHTML += `<td>DTG `+DTG_list[2]+DTG_list[3]+DTG_list[4]+`</td>`;
            } else {
                row.innerHTML += `<td>`+person[column].replace(/[\u00A0-\u9999<>\u005C\u0026\u0022\u0027]/g, i => '&#' + i.charCodeAt(0) + ';')+`</td>`;
            }
        }

        if (person.comment != "") {
            row.innerHTML += `<td class="comment_column"> <img onclick="show_comment(event, '`+person.comment.replaceAll("'", "&#39;").replace(/[\u00A0-\u9999<>\u005C\u0026\u0022\u0027]/g, i => '&#' + i.charCodeAt(0) + ';')+`')" src="/img/comment_filled_icon.svg" height="35" alt="Se kommentar"> </td>`; 
        }
    }

    // Show currently sorted after
    let cookie_list = document.cookie.split("; ");
    let sort_cookie = "";
    for (this_cookie of cookie_list) {
        if (this_cookie.split("=")[0] == "sort") {
            sort_cookie = this_cookie.split("=")[1];
        } 
    }

    try {
        sort_cookie != "" ? document.getElementById("head_"+sort_cookie).innerHTML += "<span class='header_sorted_after'> v</span>" : ""; //TODO? add text that informs it is sorted
    } catch (error) {
        //TODO? do something if the category sorted after is not shown
    }

}


function make_new() {
    window.location.href = "/detail.html";
}

function edit(id) {
    window.location.href = "/detail.html?id="+id;
}

function send_back(check_for_changes=false) {
    if (!check_for_changes || object_equals(DATA, new_data)) {
        window.location.href = "/overview.html";
    } else {
        document.getElementById("save_popup_center").className = "display_flex";
    }
}

function save_and_leave() {
    // save();
    // send_back();
    // Not used, using form insted!
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
    input_changed(document.getElementById(id));
}

function sort_table(category) {
    // Sort DATA
    DATA.sort((a, b) => (a[category] >= b[category] ? 1 : -1));
    document.cookie = "sort="+category; // Save as cookie

    // Update table //TODO make function with this task
    let is_present = document.getElementById("is_present").checked;
    let all = document.getElementById("all").checked;
    let has_left = document.getElementById("has_left").checked;

    let filtered_data = update_table_filter(is_present, all, has_left);

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

