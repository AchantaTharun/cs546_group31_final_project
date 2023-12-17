let checkName = name => {
    if(typeof name==='string'){
        name = name.trim();
        if(name==="") throw "Name strings cannot be empty";
        let re = /^[^0-9\s]+$/gi;
        let results = name.match(re);
        if(results===null) throw "Name string invalid character used";
        if(name.length<2 || name.length>25) throw "Invalid name string size";
    }
    else{
        throw "The Name is not a string type";
    }
    return name;
}

let validate = email => {
    let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/g;
    let result =  email.match(re);
    return (result!==null);
}

let checkPassword = password => {
    if(typeof password === 'string'){
        password = password.trim();
        if(password==="") throw "Passwords cannot be empty spaces";
        let re = /^[^\s]+$/gi;
        let results = password.match(re);
        if(results===null) throw "Space was present in the passowrd";
        re = /[0-9]/g;
        results = [];
        results = password.match(re);
        if(results === null) throw "No Digits were used";
        re = /[A-Z]/g;
        results=[];
        results = password.match(re);
        if(results === null) throw "No Uppercase alphabets were used";
        re = /^[a-z0-9]+$/gi;
        results=[];
        results = password.match(re);
        if(results !== null) throw "No special characters were used";
        if(password.length <  8) throw "Password must be atleast 8 characters long";
    }
    else{
        throw "The password cannot be of any other type";
    }
    return password;
}

let myForm_login = document.getElementById("login-form");

if(myForm_login)
{
    myForm_login.addEventListener('submit', (event) => {
        let emailAddressInput = document.getElementById('emailAddressInput');
        let emailAddressInput_ = emailAddressInput.value;
        let passwordInput = document.getElementById('passwordInput');
        let passwordInput_ = passwordInput.value;
        let error = document.getElementById('error');

        let missingFields = "";
    

        if(!emailAddressInput_)
        {
            missingFields+=" |Email Address| ";
        }
        if(!passwordInput_)
        {
            missingFields+=" |Password| ";
        }
        if(missingFields!=="")
        {
            event.preventDefault();
            error.innerHTML = `These fileds are missing : ${missingFields}`;
            return false;
        }

        try
        {

            if(typeof emailAddressInput_!=='string') throw "Email Address value is not a valid datatype";
            emailAddressInput_ = emailAddressInput_.trim().toLowerCase();
            if(!validate(emailAddressInput_)) throw "Email address invalid";
            passwordInput_ = checkPassword(passwordInput_);

        }catch(e)
        {
            event.preventDefault();
            error.innerHTML = e;
        }

    });
}