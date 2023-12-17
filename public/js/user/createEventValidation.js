

let checkString = (i, val) => 
{
    if(typeof i !=='string') throw `${val} input is not of the string data type`;
    i = i.trim();
    if(i==="") throw "Empty Strings are not considered to be valid Input";
    return i;
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

let errorDiv = document.getElementById("event-errors");
const eventForm = document.getElementById("create-event");
if(eventForm){
        eventForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let title = document.getElementById('title');
        title = title.value;
        // let imageInput = document.getElementById('imageInput');
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
        let endTime = document.getElementById('endTime');
        endTime = endTime.value;

        eventDate = new Date(`${eventDate}T${startTime}`);
        startTime = new Date(`${eventDate}T${startTime}`);
        endTime = new Date(`${eventDate}T${endTime}`);

        
        let missingFields = "";
    
        if(!title)
        {
 
            missingFields+=" |TITLE| ";
            
        }
        
        if(!description)
        {

            missingFields+=" |DESCRIPTION| ";
            
        }
        if(!contactEmail)
        {
 
            missingFields+=" |contactEmail| ";
            
        }
         
        if(!streetAddress)
        {
            missingFields+=" |street address| ";
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
            errorDiv.hidden = false;
            errorDiv.innerHTML = `These fileds are missing : ${missingFields}`;
            return false;
        }

        let errors = [];
        try
        {
            title = checkString(title,"Title");
            description = checkString(description, "Description");
            if(typeof contactEmail !=='string') errors.push( "Email has to be a string");
            contactEmail = contactEmail.trim();
            if(!validate(contactEmail)) errors.push( "The Email provided is not valid");
            streetAddress = checkString(streetAddress, "Street Address");
            city = checkString(city, "City");
            state = checkState(state);  //Remember that you still have to add these two functions.
            zipCode = checkZip(zipCode);

            if((parseInt(maxCapacity)-parseFloat(maxCapacity))!==0) errors.push( "Max Capcity invalid");
            maxCapacity = parseInt(maxCapacity);
            if(isNaN(priceOfAdmission)) errors.push( "Price is Invalid");
            priceOfAdmission = parseFloat(priceOfAdmission);
            if(typeof maxCapacity!=='number' || maxCapacity<=0 || !Number.isInteger(maxCapacity)) errors.push( "Max capacity value is invalid");
            if(typeof priceOfAdmission!=='number' || priceOfAdmission < 0) errors.push( "Price of Admission has an invalid value");

        
            if(errors.length > 0)
 {
  const errorsList = errors
      .map((error) => `<li>${error}</li>`)
      .join('');
    errorDiv.hidden = false;
    errorDiv.innerHTML = `<p>Please correct the errors:</p><ul>${errorsList}</ul>`;
 }
        }catch(e)
        {   
          errorDiv.hidden = false;
            errorDiv.innerHTML = e;
            return false;
        }
        eventForm.submit();
        return true;
    });
}
