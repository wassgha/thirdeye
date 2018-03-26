*Submitted to HackNYU : https://devpost.com/software/thirdeye-r1jld7*

<p align='center'>
<img src="https://i.imgur.com/1HKhrgP.png" width='200' />
</p>

**ThirdEye** is an auditory descriptive aid for visually impaired people!

*Hearing has never been this descriptive, just let ThirdEye guide you and help you with your daily tasks.*

### Inspiration
We were inspired by the amazing growth in computer vision technology and context-aware software applications and wanted to apply these new technologies to something that can actually help people in their daily lives.

### What it does

[![ThirdEye](https://img.youtube.com/vi/rwKzkArMzQU/0.jpg)](https://www.youtube.com/watch?v=rwKzkArMzQU)


ThirdEye is a wearable assistant for the legally blind that communicates outside information to its users through audio output. ThirdEye tries to augment blind people's day-to-day actions with small but really useful bits of contextual information about the tasks they are performing. In its product form, ThirdEye will be used as smart glasses, but for the prototype stage, we are using a VR headset and a mobile phone running our software. Once the blind person wears their ThirdEye headset, it will be able to see what they see and help them through :

- Face detection: ThirdEye will let you know if there are people around you and how many persons you are looking at
- Scene description and object recognition: Double tap on the headset and ThirdEye will try to describe what you are currently looking at as accurately as possible!
- Assistive reading : Using its OCR and text-to-speech modules, you can long-tap on the ThirdEye and it will detect and read any text that you are looking at! Ideal for reading the newspaper.
- Product identification : ThirdEye can help you shop for groceries! Just look at a product and ThirdEye will tell you everything it knows about it, from name, size, ingredients to price.
- Shopping assistant : ThirdEye helps you identify colors of clothes so that you shop with ease

### How we built it
We used react-native to build a front-end that connects to multiple APIs for the various tasks:

- Google Cloud Vision API for OCR and assistive reading
- The CloudSight API for scene description and color detection
- Expo.io barcode reader combined with barcodelookup.com API for finding information about products
- Face detection through the Expo.io API
- Challenges we ran into
- Uploading pictures from react-native is counter-intuitive (had to encode in base64). We also wanted to use a Facebook face recognition API in order to identify friends of the user, but the Facebook API recently changed and didn't work anymore.

### Accomplishments that we are proud of
It works :D !

### What we learned
Tried a lot (a lot!) of multiple computer vision APIs and now we know the pros and cons of each of them. We also learned how to overcome the limitations of react-native through web APIs. At the same time, we learned more about designing for accessibility and assistive technology (speech synthesis, single button control)

### What's next for ThirdEye
Hitting the app stores and maybe getting manufactured into a more compact form (think Google Glasses)

### Built With
google-cloud
node.js
npm
expo.io
react-native
cloudsight
