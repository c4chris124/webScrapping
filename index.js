const axios = require("axios");

const cheerio = require("cheerio");

const XlsxPopulate = require("xlsx-populate");

const baseUrl = "http://cssp.gob.sv/establecimientos/faces/lista.xhtml";

const recordsPerPage = 10; // Número de registros por página

const desiredRecordCount = 6615; // Número deseado de registros

// Función para realizar el web scraping y generar el archivo Excel

const scrapeDataAndGenerateExcel = async () => {
  try {
    let currentPage = 1;

    let totalRecords = 0;

    let data = [];

    // Iterar a través de las páginas hasta alcanzar el número deseado de registros

    while (totalRecords < desiredRecordCount) {
      const response = await axios.get(
        `${baseUrl}?lista:tblListaEstablecimiento=${currentPage}`
      );

      const $ = cheerio.load(response.data);

      $("table tr").each((index, element) => {
        const row = [];

        const cells = $(element).find("td");

        cells.each((index, cell) => {
          row.push($(cell).text().trim());
        });

        data.push(row);
      });

      totalRecords += recordsPerPage;

      currentPage++;
    }

    // Ajustar el número de registros en caso de exceder el límite deseado

    data = data.slice(0, desiredRecordCount);

    const workbook = await XlsxPopulate.fromBlankAsync();

    const sheet = workbook.sheet(0);

    data.forEach((row, rowIndex) => {
      row.forEach((cellValue, columnIndex) => {
        sheet.cell(rowIndex + 1, columnIndex + 1).value(cellValue);
      });
    });

    await workbook.toFileAsync("./output.xlsx");

    console.log("Archivo Excel generado correctamente.");
  } catch (error) {
    console.log("Error al realizar el web scraping:", error.message);
  }
};

scrapeDataAndGenerateExcel();
