import { NextRequest, NextResponse } from "next/server";
const { v4: uuidv4 } = require("uuid");
const pinataJWT = process.env.PINATA_JWT;

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const uuid = uuidv4();
    const body = JSON.stringify({
      keyName: uuid.toString(),
      permissions: {
        endpoints: {
          pinning: {
            pinFileToIPFS: true,
            pinJSONToIPFS: true,
          },
        },
      },
      maxUses: 1,
    });
    const keyRes = await fetch(
      "https://api.pinata.cloud/users/generateApiKey",
      {
        method: "POST",
        body: body,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${pinataJWT}`,
        },
      },
    );
    const keyResJson = await keyRes.json();
    const keyData = {
      pinata_api_key: keyResJson.pinata_api_key,
      JWT: keyResJson.JWT,
    };
    return NextResponse.json(keyData, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { text: "Error creating API Key:" },
      { status: 500 },
    );
  }
}
