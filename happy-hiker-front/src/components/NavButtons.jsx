import React from "react";
import { Stack } from "@mui/material";

export default function NavButtons() {

    return (
        <Stack direction="row" spacing={2} justifyContent="center" >
          <button style={{background:"#6B8E23"}}>Start Navigation</button>
          <button style={{background:"#6B8E23"}}> Pause for Stretches</button>
          <button style={{background:"#6B8E23"}}>Stop Navigation</button>
        </ Stack>
    )
}