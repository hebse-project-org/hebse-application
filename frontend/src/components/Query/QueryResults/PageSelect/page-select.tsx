import {Box, TablePagination} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledPaginator = styled(TablePagination)(() => ({
  fontFamily: "monospace",
  color: "white",
  backgroundColor: "#3a303d",
  border: "white 2px solid",
  borderRadius: "15px",
  "& .MuiTablePagination-select": {
    fontSize: "14px",
    fontFamily: "monospace",
  },
  "& .MuiTablePagination-selectLabel": {
    fontSize: "14px",
    fontFamily: "monospace"
  },
  "& .MuiTablePagination-displayedRows": {
    fontSize: "14px",
    fontFamily: "monospace"
  }
}));

export const PageSelect = ({ setPageNumber, pageNumber, rows, rowsPerPage, setRowsPerPage }: { setPageNumber: (value: (((previousState: number) => number) | number)) => void, pageNumber: number, rows: number, rowsPerPage: number, setRowsPerPage: (value: (((previousState: number) => number) | number)) => void}) => {
  const handleChangePage = (
      _: React.PointerEvent<HTMLButtonElement> | null,
      newPage: number,
    ) => {
      setPageNumber(newPage);
    };

  const handleChangeRowsPerPage = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setRowsPerPage(Number.parseInt(event.target.value, 10));
      setPageNumber(0);
    };
  
  return <Box
    component="div"
    sx={{
      maxWidth: "lg",
      fontFamily: "monospace",
      display: "flex",
      justifyContent: "flex-end"}}>
      <StyledPaginator rowsPerPage={rowsPerPage} labelRowsPerPage="Records Per Page" count={rows} page={pageNumber} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{"& .MuiIconButton-root": {color: "white",}}} slotProps={{
        select: {
          MenuProps: {
            PaperProps: {
              sx: {
                backgroundColor: "#2e2d2e",
                color: "white"
              }
            }
          }
        },
        menuItem: {
          sx: {
            fontFamily: "monospace",
            fontSize: "14px"
          }
        },
      }}/>
  </Box>
}