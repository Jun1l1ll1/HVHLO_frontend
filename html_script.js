
function getTableData() {
    
    change_hospital_name(HOSPITAL_NAME);

    // Create the table
    let table_head = document.getElementById("table_head_row");
    let h = {
        first_name: "Fornavn",
        last_name: "Etternavn",
        birth: "Fødselsdato",
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

    let cookie_list = document.cookie.split("; ")
    let filter_cookie = "all";
    let header_cookie = [];
    for (this_cookie of cookie_list) {
        if (this_cookie.split("=")[0] == "filter") {
            filter_cookie = this_cookie.split("=")[1];
        } 
        else if (this_cookie.split("=")[0] == "table_header") {
            header_cookie = [...this_cookie.split("=")[1].split(",")];
        }
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


    let headers = [];
    for (child of document.getElementById("header_choices").children) {
        if (child.selected) {
            headers.push(child.value);
        }
    }

    for (head of headers) {
        table_head.innerHTML += `<th>`+h[head]+`</th>`;
    }

    let filtered_data;
    filtered_data = update_table_filter(document.getElementById("is_present").checked, document.getElementById("all").checked, document.getElementById("has_left").checked);
    

    //TODO? format fields with dates and time better
    let table_body = document.getElementById("table_body");
    for (person of filtered_data) {
        table_body.innerHTML += `<tr id="person_id_`+person.id+`" onclick="edit('`+person.id+`')"></tr>`;
        let row = document.getElementById("person_id_"+person.id);
        for (column of headers) {
            if (column == "comment") {
                let yn = person[column] != "" ? "Ja" : "Nei";
                row.innerHTML += `<td>`+yn+`</td>`;
            } else {
                row.innerHTML += `<td>`+person[column]+`</td>`;
            }
        }
    }
}

function getPersonData() {
    function create_table(
        f_name="",
        l_name="",
        birth="",
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

        let table = document.getElementById("table_body"); 
        table.innerHTML += `
        <tr>
            <th>Ankomst</th>
            <td>
                <div style="display: grid; grid-template-columns: auto fit-content(50%);">
                    <input onchange="input_changed(this)" class="input_date_empty" type="datetime-local" name="arrival" id="arrival" value="`+arrival+`"/>
                    <button type="button" onclick="set_date_to_now('arrival')" style="padding-left: 10px; padding-right: 10px;">Nå</button>
                </div>
            </td>
        </tr>
        <tr>
            <th>Forrnavn</th>
            <td><input onchange="input_changed(this)" maxlength="50" type="text" name="first_name" id="first_name" value="`+f_name+`"/></td>
        </tr>
        <tr>
            <th>Etternavn</th>
            <td><input onchange="input_changed(this)" maxlength="50" type="text" name="last_name" id="last_name" value="`+l_name+`"/></td>
        </tr>
        <tr>
            <th>Fødselsdato</th>
            <td><input onchange="input_changed(this)" class="input_date_empty" type="date" name="birth" id="birth" value="`+birth+`"/></td>
        </tr>
        <tr>
            <th>Kritikalitet</th>
            <td>
                <select onchange="input_changed(this)" name="criticality" id="criticality">
                    <option value=""></option>
                    <option value="unknown">Uavklart</option>
                    <option value="critical">Kritisk</option>
                    <option value="stable">Stabil</option>
                </select>
            </td>
        </tr>
        <tr>
            <th>Flyttbarhet</th>
            <td>
                <select onchange="input_changed(this)" name="movability" id="movability">
                    <option value=""></option>
                    <option value="can_walk">Kan gå</option>
                    <option value="stretcher">Båre</option>
                    <option value="intravenously">Intravenøst</option>
                </select>
            </td>
        </tr>
        <tr>
            <th>Forventet avreise</th>
            <td>
                <div style="display: grid; grid-template-columns: auto fit-content(50%);">
                    <input onchange="input_changed(this)" class="input_date_empty" type="datetime-local" name="expected_departure" id="expected_departure" value="`+exp_departure+`"/>
                    <button type="button" onclick="set_date_to_now('expected_departure')" style="padding-left: 10px; padding-right: 10px;">Nå</button>
                </div>
            </td>
        </tr>
        <tr>
            <th>Avreise</th>
            <td>
                <div style="display: grid; grid-template-columns: auto fit-content(50%);">
                    <input onchange="input_changed(this)" class="input_date_empty" type="datetime-local" name="departure" id="departure" value="`+departure+`"/>
                    <button type="button" onclick="set_date_to_now('departure')" style="padding-left: 10px; padding-right: 10px;">Nå</button>
                </div>
            </td>
        </tr>
        <tr>
            <th>Avreisestatus</th>
            <td>
                <select onchange="input_changed(this)" name="departure_status" id="departure_status">
                    <option value=""></option>
                    <option value="death">Død</option>
                    <option value="perm_disability">Utskrevet med permanent funksjonshemming</option>
                    <option value="medical_evac">Medisinsk evakuering</option>
                    <option value="medical_repat">Medisinsk repatriering</option>
                    <option value="civil_life">Returnert til sivilt liv</option>
                    <option value="dutie_modified">Returnert til tjeneste (modifisert tjeneste)</option>
                    <option value="dutie_rtd">Returnert til tjeneste (RTD)</option>
                    <option value="dutie_rtu">Returnert til korps (RTU)</option>
                    <option value="stratevac">Strategisk evakuering (stratevac)</option>
                </select>
            </td>
        </tr>
        <tr>
            <th>Avreisedestinasjon</th>
            <td><input onchange="input_changed(this)" maxlength="50" type="text" name="departure_destination" id="departure_destination" value="`+departure_destination+`"/></td>
        </tr>
        <tr>
            <th>Nasjonalitet</th>
            <td><input onchange="input_changed(this)" maxlength="50" type="text" name="nationality" id="nationality" value="`+nationality+`"/></td>
        </tr>
        <tr>
            <th>Nasjonal ID</th>
            <td><input onchange="input_changed(this)" maxlength="50" type="text" name="national_id" id="national_id" value="`+national_id+`"/></td>
        </tr>
        `
        // Sets the <select>s to existing info
        document.getElementById("criticality").value = criticality;
        document.getElementById("movability").value = movability;
        document.getElementById("departure_status").value = departure_status;

        // Changes color back to white if value exists in date-inputs
        document.getElementById("arrival").value != "" ? document.getElementById("arrival").className = "" : "";
        document.getElementById("arrival").value != "" ? document.getElementById("arrival").className = "" : "";
        document.getElementById("arrival").value != "" ? document.getElementById("arrival").className = "" : "";

        // Add the comment if one exists
        if (comment.replaceAll("\n", "").replaceAll(" ", "") != "") {
            document.getElementById("no_comment_cont").className = "disappear";
            document.getElementById("comment").className = "";
            document.getElementById("comment").innerText = comment;
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


function input_changed(e) { //TODO? save current editing in cookie/page-storage
    // Update title if name or age was changed
    if (e.id == "first_name" || e.id == "last_name" || e.id == "birth") {
        let f_name = document.getElementById("first_name").value;
        let l_name = document.getElementById("last_name").value;
        f_name == "" && l_name == "" ? f_name = "Ukjent" : "";
        
        document.getElementById("name_title").innerText = f_name +" "+ l_name;
    }

    if (e.type == "date" || e.type == "datetime-local") {
        if (e.value != "") {
            e.className = "";
        } else {
            e.className = "input_date_empty";
        }
    }

    // Update new_data
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
        table_head.innerHTML += `<th>`+h[head]+`</th>`;
    }

    let table_body = document.getElementById("table_body");
    table_body.innerHTML = "";
    for (person of filtered_data) {
        table_body.innerHTML += `<tr id="person_id_`+person.id+`" onclick="edit('`+person.id+`')"></tr>`;
        let row = document.getElementById("person_id_"+person.id);
        for (column of table_headers) {
            if (column == "comment") {
                let yn;
                person[column] != "" ? yn = "Ja" : yn = "Nei";
                row.innerHTML += `<td>`+yn+`</td>`;
            } else {
                row.innerHTML += `<td>`+person[column]+`</td>`;
            }
        }
    }
}


function make_new() {
    window.location.href = "/detail.html";
}

function edit(id) {
    window.location.href = "/detail.html?id="+id;
}

function send_back() {
    window.location.href = "/overview.html";
}

function save_and_leave() {
    // save();
    // send_back();
    // Not used, using form insted!
}

function add_comment() { //TODO add a "there-is-a-comment-but-dont-show" feature (a speach bubble)
    document.getElementById("no_comment_cont").className = "disappear";
    document.getElementById("comment").className = "";
    document.getElementById("comment_note").className = "hide";
}

function close_comment() {
    document.getElementById("comment").className = "disappear";
    document.getElementById("no_comment_cont").className = "";
    document.getElementById("comment_note").className = "disappear";
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

