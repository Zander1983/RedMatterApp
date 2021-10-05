import {FormSteps} from "../FormSteps";
import { useStyles } from './style'
import { Typography, Grid, Divider } from "@material-ui/core"

interface PrototypeFormType  {
  workspaceID: string;
  onSend?: Function;
}

// THE COMPILED FORM
export default function PrototypeForm2({workspaceID,onSend}:PrototypeFormType) {
  const classes = useStyles();

  return (
    <Grid className={classes.grid}>
      <div className={classes.gridContainer} >
        { FormSteps.map((item, index) => (
          <>
            <Grid container spacing={3} key={index}>
              <Grid item xs={5}>
                <Typography className={classes.instructions}>
                  {item.title}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                {item.component}
              </Grid>
            </Grid>
            <Divider className={classes.divider} ></Divider>
          </>
        )) }
      </div>
    </Grid>
  );
}
