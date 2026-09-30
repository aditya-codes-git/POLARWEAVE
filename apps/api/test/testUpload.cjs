const fs = require('fs');

async function testUpload() {
  // Create 1x1 test PNG
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const buffer = Buffer.from(pngBase64, 'base64');
  
  const blob = new Blob([buffer], { type: 'image/png' });
  const formData = new FormData();
  formData.append('files', blob, 'retinal_scan_oct_01.png');

  console.log('Sending upload request to http://localhost:5000/api/ingest/process ...');
  const res = await fetch('http://localhost:5000/api/ingest/process', {
    method: 'POST',
    body: formData
  });

  const json = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(json, null, 2));

  if (json.data?.job?.id) {
    const jobRes = await fetch(`http://localhost:5000/api/ingest/jobs/${json.data.job.id}`);
    const jobJson = await jobRes.json();
    console.log('Job details:', JSON.stringify(jobJson, null, 2));
  }
}

testUpload().catch(console.error);
