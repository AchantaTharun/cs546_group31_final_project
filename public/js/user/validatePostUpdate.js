const postUpdateForm = document.getElementById("entity-update");
if(postUpdateForm){
        postUpdateForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let title = document.getElementById('title');
        title = title.value;
        let imageSrc = document.getElementById('imageSrc');
        imageSrc = imageSrc.value;
        let description = document.getElementById('description');
        description = description.value;
        let titleOld = document.getElementById('titleOld');
        titleOld = titleOld.value;
        let descriptionOld = document.getElementById('descriptionOld');
        descriptionOld = descriptionOld.value;
        let error = document.getElementById('error');
        let missingFields = "";
    
        if(!title)
        {
            missingFields+=" |TITLE| ";   
        }
        if(!imageSrc)
        {
            missingFields+=" |IMAGE FILE| ";
        }
        if(!description)
        {
            missingFields+=" |DESCRIPTION| ";
        }
        if(missingFields!=="")
        {
            error.innerHTML = `These fileds are missing : ${missingFields}`;
            return false;
        }

        try
        {
            if((description.trim()===descriptionOld.trim()) && (title.trim()===titleOld.trim()))
            {
                throw "You need to change something, so that we can update";
            } 
            if((description.trim()==="") || (title.trim()===""))
            {
                throw "Neither Description nor Title can be changed to empty values";
            }

        }catch(e)
        {
            error.innerHTML = e;
            return false;
        }
        postUpdateForm.submit();
        return true;
    });
}
