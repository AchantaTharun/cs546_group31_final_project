let checkString = (i) => 
{
    if(typeof i !=='string') throw "Input is not of the string data type";
    i = i.trim();
    if(i==="") throw "Empty Strings are not considered to be valid Input";
    return i;
}

let dateCheck = (dateString) => {
    if(typeof dateString !=='string') return false;
    const parsedDate = new Date(dateString);
    return !isNaN(parsedDate) && dateString.trim().length > 0;
}

let isEarlierInSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

let checkState = (state) =>{
    if(typeof state !=='string') throw "State parameter is not of string datatype";
    state = state.trim();
    if(state==="") throw "Empty Spaced states are not allowed";
    const states = [ "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI"];
    if(state.length !== 2) throw "Only Abbreviations allowed for states"; 
    if(!states.includes(state.toUpperCase())) throw "Wrong Abbreviation used for State";
    return state.toUpperCase();
}

let checkZip = (zip) => {
    if(typeof zip!=='string') throw "ZIP code can only be string";
    zip = zip.trim();
    if(zip.length!= 5 || isNaN(zip)) throw "Invalid value for zip code";
    return zip;
}

let validate = (email) => {
    let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/g;
    let result =  email.match(re);
    return (result!==null);
}

const eventForm = document.getElementById("create-event");
if(eventForm){
        eventForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let title = document.getElementById('title');
        title = title.value;
        let imageInput = document.getElementById('imageInput');
        let description = document.getElementById('description');
        description = description.value;
        let contactEmail = document.getElementById('contactEmail');
        contactEmail = contactEmail.value;
        let city = document.getElementById('city');
        city = city.value;
        let streetAddress = document.getElementById('streetAddress');
        streetAddress = streetAddress.value;
        let state = document.getElementById('state');
        state = state.value;
        let zipCode = document.getElementById('zipCode');
        zipCode = zipCode.value;
        let maxCapacity = document.getElementById('maxCapacity');
        maxCapacity = maxCapacity.value;
        let priceOfAdmission = document.getElementById('priceOfAdmission');
        priceOfAdmission = priceOfAdmission.value;
        let eventDate = document.getElementById('eventDate');
        eventDate = eventDate.value;
        let startTime = document.getElementById('startTime');
        startTime = startTime.value;
        let totalNumberOfAttendees = document.getElementById('totalNumberOfAttendees');
        totalNumberOfAttendees = totalNumberOfAttendees.value;
        let endTime = document.getElementById('endTime');
        endTime = endTime.value;
        let error = document.getElementById('error');
        let missingFields = "";
    
        if(!title)
        {
 
            missingFields+=" |TITLE| ";
            
        }
        if(imageInput.files.length <= 0)
        {
            missingFields+=" |IMAGE FILE| ";
        }
        if(!description)
        {

            missingFields+=" |DESCRIPTION| ";
            
        }
        if(!contactEmail)
        {
 
            missingFields+=" |contactEmail| ";
            
        }
        if(!city)
        {
            missingFields+=" |city| ";
        }
        if(!state)
        {

            missingFields+=" |state| ";
            
        }
        if(!zipCode)
        {
 
            missingFields+=" |zipCode| ";
            
        }
        if(!maxCapacity)
        {
            missingFields+=" |maxCapacity| ";
        }
        if(!priceOfAdmission)
        {

            missingFields+=" |priceOfAdmission| ";
            
        }
        if(!eventDate)
        {
 
            missingFields+=" |eventDate| ";
            
        }
        if(!startTime)
        {
            missingFields+=" |startTime| ";
        }
        if(!endTime)
        {

            missingFields+=" |endTime| ";
            
        }
        if(missingFields!=="")
        {
            error.innerHTML = `These fileds are missing : ${missingFields}`;
            return false;
        }

        try
        {
            title = checkString(title);
            description = checkString(description);
            if(typeof contactEmail !=='string') throw "Email has to be a string";
            contactEmail = contactEmail.trim();
            if(!validate(contactEmail)) throw "The Email provided is not valid";
            streetAddress = checkString(streetAddress);
            city = checkString(city);
            state = checkState(state);  //Remember that you still have to add these two functions.
            zipCode = checkZip(zipCode);

            if((parseInt(maxCapacity)-parseFloat(maxCapacity))!==0) throw "Max Capcity invalid";
            maxCapacity = parseInt(maxCapacity);
            if(isNaN(priceOfAdmission)) throw "Price is Invalid";
            priceOfAdmission = parseFloat(priceOfAdmission);
            if(typeof maxCapacity!=='number' || maxCapacity<=0 || !Number.isInteger(maxCapacity)) throw "Max capacity value is invalid";
            if(typeof priceOfAdmission!=='number' || priceOfAdmission < 0) throw "Price of Admission has an invalid value";
            // if(!help.isDate(eventDate)) throw "THe event date value is not proper";

            eventDate = checkString(eventDate);
            if(!dateCheck(eventDate)) throw "Event Date couldn't be parsed";

            startTime = checkString(startTime);

            if(!dateCheck(startTime)) throw "Start time couldn't be parsed";
            endTime = checkString(endTime);

            if(!dateCheck(endTime)) throw "End time couldn't be parsed";
            
            if(!isEarlierInSameDay(new Date(startTime),new Date(endTime))) throw "Start time and End time should be on the same day";
            if(!isEarlierInSameDay(new Date(startTime),new Date(eventDate))) throw "Event Date and Start time should be on the same day";
            if((new Date()) > (new Date(eventDate))) throw "You cannot have an event date and time in the past";
            if((new Date(eventDate)) > (new Date(startTime))) throw "You cannot have an event Start date and time in the past";
            if((new Date(startTime)) >= (new Date(endTime))) throw "You cannot have an event date and time in the past";
        
            if(parseInt(totalNumberOfAttendees) > parseInt(maxCapacity)) throw "Number of attendees are invalid";

        }catch(e)
        {
            error.innerHTML = e;
            return false;
        }
        postForm.submit();
        return true;
    });
}
