
const postForm = document.getElementById("entity-display");
if(postForm){
        postForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let title = document.getElementById('title');
        title = title.value;
        console.log(title);
        let imageInput = document.getElementById('imageInput');
        let description = document.getElementById('description');
        description = description.value;
        let comment = document.getElementById('comment');
        comment = comment.value;
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
        if(missingFields!=="")
        {
            error.innerHTML = `These fileds are missing : ${missingFields}`;
            return false;
        }

        try
        {
            if(comment && comment.trim()==="") throw "If you want to pass a comment, it cannot be just spaces";

        }catch(e)
        {
            error.innerHTML = e;
            return false;
        }
        postForm.submit();
        return true;
    });
}
