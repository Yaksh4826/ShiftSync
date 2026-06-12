"use client"
import React, { use } from 'react'
import { FormStateSubscribe, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { createWorker } from 'tesseract.js'


const Page = () => {
  const { register, handleSubmit, watch, isSubmitting} = useForm()
  const selectedFile = watch('image')
  const [isFound, changeFound] = useState(false);

  const onSubmit = (data) => {
   if (!selectedFile?.length || !selectedFile[0]) {
  return;
}
 const file  = selectedFile[0]
    const objectURl =  URL.createObjectURL(file);
    (async () => {
  const worker = await createWorker('eng');
  const ret = await worker.recognize(objectURl);
  console.log(ret.data.text);
  const rawText =  ret.data.text;
  const splittedLines = rawText.split("\n");
  let Days = []
      
  splittedLines.forEach(element => {
  if (/cook/i.test(element)) {
    // Now for each detected line we have to split the date , time , Location and Role
    let currentYear =  new Date().getFullYear()
    let datematch =  element.match(/^[A-Za-z]{3} \d{2}/);
    if(!datematch) return ;

    const date  = datematch[0];
   const formattedDate = new Date(date).toISOString()  // Formatted Date

// 1. Run your time extraction regex match
const timeRegex = /(\d{2}:\d{2}[APM]{2})\s*-\s*(\d{2}:\d{2}[APM]{2})/i;
const timeMatch = element.match(timeRegex);

if (timeMatch) {
  const startRaw = timeMatch[1]; // e.g., "04:30PM"
  const endRaw = timeMatch[2];   // e.g., "10:00PM"

  // 2. Re-usable helper function to handle the 24-hour clock conversion math cleanly
  const convertTo24HourStr = (rawTimeStr) => {
    const modifier = rawTimeStr.slice(-2).toUpperCase(); 
    const timeNumbers = rawTimeStr.slice(0, -2);         
    let [hours, minutes] = timeNumbers.split(':');    

    let numericHours = parseInt(hours, 10);

    if (modifier === 'PM' && numericHours !== 12) {
      numericHours += 12; 
    } else if (modifier === 'AM' && numericHours === 12) {
      numericHours = 0;   
    }

    const cleanHours = String(numericHours).padStart(2, '0'); 
    return `${cleanHours}:${minutes}:00`; // Returns standard "HH:mm:ss"
  };

  // 3. Run BOTH variables through the conversion process
  const finalStartTime24h = convertTo24HourStr(startRaw); // "16:30:00"
  const finalEndTime24h = convertTo24HourStr(endRaw);     // "22:00:00"

  // 4. Construct unified date-time string contexts safely
  // Ensure your 'date' variable contains Month + Day + Year (e.g., "Jun 09 2026")
  const startContext = `${currentYear} ${date} ${finalStartTime24h}`;
  const endContext = `${currentYear} ${date} ${finalEndTime24h}`;
 
  // 5. Convert directly to clean MongoDB Schema ISO format
  const isoStartTime = new Date(startContext).toISOString(); 
  const isoEndTime = new Date(endContext).toISOString();     

}
// Now we have the date and time form the shift .





  }

});


  console.log("-----------Text detection completed ------------")
  await worker.terminate();
})();

  changeFound(true)
  }



  return (
    <div>
      <div className="mt-4 flex flex-col gap-3 w-screen items-center h-5/12 justify-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1>Upload your work schedule image</h1>

          {/* Upload image file goes here using react-hook-form */}
         <input className='border-1 rounded-md m-1'
        type="file"
        {...register("image", {
          required: "Please select an image",
          validate: {
            fileSize: (value) => {
              if (!value[0]) return true;
              return value[0].size <= 2000000 || "File size must be less than 2MB";
            },
            fileType: (value) => {
              if (!value[0]) return true;
              return (
                ["image/jpeg", "image/png", "image/gif"].includes(value[0].type) ||
                "Only JPEG, PNG, and GIF files are allowed"
              );
            },
          },
        })}
        placeholder='Choose image'
      />
          <Button type="submit" className="btn" variant='default' disabled={isSubmitting}>
            Upload
          </Button>
        </form>

        {selectedFile && selectedFile[0] && (
          <p>Selected file: {selectedFile[0].name}</p>
        )}

        {isFound&& <div> Processing successfully done and valid screenshot </div>}
          
        
      </div>
    </div>
  )
}

export default Page
