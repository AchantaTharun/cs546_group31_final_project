//This is General Purpose
import * as e_valid from 'email-validator';

let emailc = mail => {
    try
    {
        if(!e_valid.validate(mail)) return false;
        return true;

    }catch(e)
    {
        return false;
    }
}
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

//This is Mongoose Specific
let checkNametf = name => {
    if(typeof name==='string'){
        if(name==="") return false;
        let re = /^[^0-9\s]+$/gi;
        let results = name.match(re);
        if(results===null) return false;
        if(name.length<2 || name.length>25) return false;
    }
    else{
        return false;
    }
    return true;
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

let checkPasswordtf = password => {
    if(typeof password === 'string'){
        if(password==="") return false;
        let re = /^[^\s]+$/gi;
        let results = password.match(re);
        if(results===null) return false;
        re = /[0-9]/g;
        results = [];
        results = password.match(re);
        if(results === null) return false;
        re = /[A-Z]/g;
        results=[];
        results = password.match(re);
        if(results === null) return false;
        re = /^[a-z0-9]+$/gi;
        results=[];
        results = password.match(re);
        if(results !== null) return false;
        if(password.length <  8) return false;
    }
    else{
        return false;
    }
    return true;
}



export {checkName,checkNametf,checkPassword,checkPasswordtf,emailc};