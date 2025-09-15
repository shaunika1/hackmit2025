### hackmit2025
#Our Project for HackMIT 2025
# Demo Video 
https://www.youtube.com/watch?v=TgkCfh6O53s 
## Inspiration
# What inspired you to create this project?
We are all familiar with searching up symptoms on Google and being shown the worst-case diagnosis, ranging from cancer to life-threatening kidney failure. Despite AI’s significant contributions to healthcare, few tools are accessible directly to patients, and even fewer are trained to display consistent, reliable results. Hack My Heart was designed to address this gap by integrating hardware and software to deliver preliminary health consultations. By gathering vital signs and symptoms, it provides personalized guidance, helping patients prepare for a doctor’s visit or supporting those without immediate access to healthcare.
# What it does
The user places their finger on a pulse sensor, which records BPM data and sends it to the Raspberry Pi. The Pi transmits this data to the frontend of our full-stack website, where the user’s heart rate is dynamically displayed. Our trained Toolhouse AI agent then analyzes the BPM to determine whether the rate is normal, elevated, or critically high. Users can also enter additional symptoms or upload a medical history PDF, which the agent incorporates into its health assessment. Together, these features provide the user with meaningful insight into their health status.
# How we built it
We built our project using a pulse sensor connected to an Arduino. We used Flask to make the backend of the website that stores sensor data, PDF upload data, and implements the Toolhouse AI agent. Lastly, we utilized React.js and Next.js to make the frontend of the website. 
# Individual Contributions
Sarah: Created the pulse sensor, configured the Arduino, modified open source code to interpret the voltage from the sensor as BPM and connected the code for the Arduino to the website
Shaunika: Created the preliminary backend, worked on frontend with teammates, attempted to connect AI agent to website, made project description and presentation
Anahita: Refined backend, successfully connected AI agent to website, worked with Sarah to create smooth transition from pi to website
Aboubakary: Built React components, designed the website UI, integrated BPM data fetching from Arduino backend, and tested functionality to ensure smooth performance.
Everyone: Provided moral support, had a blast!
# Challenges we ran into
We had very ambitious goals for this hackathon, but our team was limited in what we could accomplish since we were all beginners. 
It took us a while to get used to React.js and use the terminal node.js prompts. 
We got stuck on implementing the PDF upload to text feature for a few hours.
We had delays in correctly integrating the Toolhouse AI agent into our website. 
Lastly, we couldn’t get the mini-SD card to be compatible with our Raspberry Pi, so we had to switch to an Arduino setup at the last minute.
# Accomplishments that we're proud of
We connected hardware, backend, and frontend for the first time in our lives! It was extremely rewarding. 
# What we learned
On the hardware side, we learned how op-amps, ADCs, and sensors work. We also learned how important it is to understand your code when debugging. This hackathon served as a crash course for all of us in backend and React.js, as well as how to implement API keys securely in backend.
# What's next for our project
We want to implement even more sensors to make this an all-in-one vital checker. Further, we would love to add guidelines to the AI to ensure medical data is stored securely and is compliant with HIPAA. Lastly, we feel that this concept has the ability to be expanded to give information beyond BPM, so we could train the AI to help patients with any symptoms, or give options to specialize it to help different users (ex. Pediatrics, Cardiology, Gynocology). 
