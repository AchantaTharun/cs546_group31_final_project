const gymForm = document.getElementById("gym-submit");
const trainerForm = document.getElementById("trainer-submit");
if(gymForm){
        gymForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let reason = document.getElementById('reason');
        reason = reason.value;
        let error = document.getElementById('error');
        

        if(!reason || (typeof reason !=='string') || reason.trim()==="")
        {
            error.innerHTML = "Reason must be provided";
            return false;
        }
        gymForm.submit();
    });
}

if(trainerForm){
    trainerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let reason = document.getElementById('reason');
    reason = reason.value;
    let error = document.getElementById('error');

    if(!reason || (typeof reason !=='string') || reason.trim()==="")
    {
        error.innerHTML = "Reason must be provided";
        return false;
    }
    gymForm.submit();
});
}