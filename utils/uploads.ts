export async function uploadFile(selectedFile: File | undefined) {
  if (!selectedFile) {
    console.log("no file provided!");
    return;
  }
  try {
    const tempKey = await fetch("/api/key", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const keyData = await tempKey.json();

    const formData = new FormData();
    formData.append("file", selectedFile);

    const metadata = JSON.stringify({
      name: `${selectedFile.name}`,
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", options);

    const uploadRes = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${keyData.JWT}`,
        },
        body: formData,
      },
    );
    console.log({ uploadResStatus: uploadRes.status });
    if (uploadRes.status != 200) {
      throw Error;
    }
    const uploadResJson = await uploadRes.json();
    const cid = uploadResJson.IpfsHash;
    console.log(cid);
    return cid;
  } catch (error) {
    console.log("Error uploading file:", error);
  }
}

export async function uploadJson(content: any) {
  try {
    const data = JSON.stringify({
      pinataContent: content,
      pinataOptions: {
        cidVersion: 1,
      },
    });
    const tempKey = await fetch("/api/key", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const keyData = await tempKey.json();

    const uploadRes = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keyData.JWT}`,
        },
        body: data,
      },
    );
    const uploadResJson = await uploadRes.json();
    const cid = uploadResJson.IpfsHash;
    console.log(cid);
    return cid;
  } catch (error) {
    console.log("Error uploading file:", error);
  }
}
