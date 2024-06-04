const axios  = require('axios') ;

axios.get('http://localhost:3001/images')
            .then(response => {
                // Initialize images with showControls set to false
                const imagesWithShowControls = response.data.map(image => ({
                    ...image,
                    showControls: false
                }));
                console.log(imagesWithShowControls.x) ;
                // setImages(imagesWithShowControls);
            }).catch(err => {
                console.log(err) ;
            } ) 