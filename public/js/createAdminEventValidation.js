const create_event = document.querySelector("#create-event");


create_event.addEventListener("submit",async event =>{
    event.preventDefault();
    const img = document.getElementById("imageInput");
    let error = document.getElementById('error');
    let image = document.getElementById('img');
    const file = img.files[0];

    
    try{
        //Creating a url for a secure connection to the S3 bucket
        const {url} = await fetch("/admin/s3Url").then(res=>res.json())
        console.log(url);
    
        //In the case if the URL is empty...
        if(!url)
        {
            error.innerHTML = "URL was empty and no errors were thrown";
            throw "No Url Was generated"; 
        }

        // Post the image throught the url
        await fetch(url,{
            method:"PUT",
            headers: {
                "Content-Type": "multipart/form-data"
            },
            body: file
        });

        //Now the url contains the name with which the image can be accessed
        const imageUrl = url.split('?')[0];
        image.value = imageUrl;
        create_event.submit();  //The Image link from the S3 bucket will be stored in the img field in the eventModel.


} catch(e)
{
    event.preventDefault();
    error.innerHTML = "Some fault in the AWS Image Upload part";
    return false;
}

})