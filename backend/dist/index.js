"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const exceljs_1 = __importDefault(require("exceljs"));
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const slugify_1 = __importDefault(require("slugify"));
dotenv_1.default.config({
    path: '../../.env'
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const LIST_TABLE = 'tula';
// Подключение к SQLite
const db = new better_sqlite3_1.default(path_1.default.join(__dirname, '../resource/databases/regionru.db'));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Логирование
app.use('/api', (req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
const frontendPath = path_1.default.join(__dirname, '../../frontend/dist');
app.use(express_1.default.static(frontendPath));
app.get('*any', (req, res) => {
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
// ========== Получение списка ==========
app.get('/api/list', (req, res) => {
    try {
        const { category, id } = req.query;
        let sql = `SELECT * FROM ${LIST_TABLE}`;
        const params = [];
        if (!id && category) {
            sql += ' WHERE LOWER(kategor) LIKE LOWER(?)';
            params.push(`%${category}%`);
        }
        if (id) {
            sql += ' WHERE _id = ?';
            params.push(Number(id));
        }
        const list = db.prepare(sql).all(...params);
        res.json(list);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
function changeRowColor(row, color) {
    for (let col = 1; col <= 6; col++) {
        row.getCell(col).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: `FF${color}` }
        };
    }
}
function setBorderRange(sheet, startRow, endRow, startCol = 1, endCol = 6) {
    for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
        const row = sheet.getRow(rowNum);
        for (let col = startCol; col <= endCol; col++) {
            row.getCell(col).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }
}
// colors
const lightBlueColor = '95B3D7';
const whiteColor = 'FFFFFF';
const darkBlueColor = '31869B';
// ========== Генерация сметы ==========
app.post('/api/generate-smeta', async (req, res) => {
    try {
        const year = new Date().getFullYear();
        const { object, places = {}, transportCost, trashCost } = req.body;
        if (!object)
            throw new Error('Не передано или некорректное наименование объекта');
        if (Object.entries(places).length == 0)
            throw new Error('Добавляемые работы невозможно обработать');
        // Загружаем шаблон
        const workbook = new exceljs_1.default.Workbook();
        await workbook.xlsx.readFile(path_1.default.join(__dirname, '../resource/templates/template.xlsx'));
        const sheet = workbook.getWorksheet(1);
        if (!sheet) {
            throw new Error('Лист не найден в шаблоне');
        }
        // Шапка
        sheet.getCell('C4').value = object;
        const cellA6 = sheet.getCell('A6');
        if (typeof cellA6.value === 'string') {
            cellA6.value = cellA6.value.replace('ГОД', year.toString());
        }
        // Заполнение работ
        let totalSum = 0;
        let currentRow = 9;
        for (const [placeName, works] of Object.entries(places)) {
            let num = 1;
            // Название помещения
            const placeRow = sheet.getRow(currentRow);
            sheet.mergeCells(`B${currentRow}:F${currentRow}`);
            changeRowColor(placeRow, lightBlueColor);
            const placeNameCell = placeRow.getCell(2);
            placeNameCell.value = placeName;
            placeNameCell.alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
            placeNameCell.font = { bold: true, color: { argb: `FF${whiteColor}` } };
            placeRow.commit();
            currentRow++;
            // Работы внутри помещения
            for (const work of works) {
                const qty = Number(work.quantity) || 0;
                const name = work.name || '';
                const price = Number(work.price) || 0;
                const sum = qty * price;
                totalSum += sum;
                const row = sheet.getRow(currentRow);
                row.getCell(1).value = num++;
                row.getCell(2).value = name;
                row.getCell(3).value = work.unit || '';
                row.getCell(4).value = qty;
                row.getCell(5).value = price;
                row.getCell(5).numFmt = '#,##0"р."';
                row.getCell(6).value = {
                    formula: `D${currentRow}*E${currentRow}`,
                    result: sum
                };
                row.eachCell((cell, num) => {
                    cell.alignment = {
                        wrapText: true,
                        horizontal: num == 2 ? 'left' : 'center',
                        vertical: 'middle'
                    };
                });
                row.commit();
                currentRow++;
            }
        }
        // Транспортные расходы
        if (transportCost) {
            const transportRow = sheet.getRow(currentRow);
            changeRowColor(transportRow, lightBlueColor);
            transportRow.getCell(2).value = 'ТРАНСПОРТНЫЕ РАСХОДЫ';
            transportRow.getCell(3).value = 'комплекс';
            transportRow.getCell(4).value = 1;
            transportRow.getCell(5).value = transportCost;
            transportRow.getCell(6).value = transportCost;
            transportRow.eachCell((cell, num) => {
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: num == 2 ? 'left' : 'center',
                    wrapText: true
                };
            });
            transportRow.commit();
            totalSum += Number(transportCost) || 0;
            currentRow++;
        }
        if (trashCost) {
            const trashRow = sheet.getRow(currentRow);
            changeRowColor(trashRow, lightBlueColor);
            trashRow.getCell(2).value = 'ВЫНОС И УБОРКА МУСОРА';
            trashRow.getCell(3).value = 'комплекс';
            trashRow.getCell(4).value = 1;
            trashRow.getCell(5).value = trashCost;
            trashRow.getCell(6).value = trashCost;
            trashRow.eachCell((cell, num) => {
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: num == 2 ? 'left' : 'center',
                    wrapText: true
                };
            });
            trashRow.commit();
            totalSum += Number(trashCost) || 0;
            currentRow++;
        }
        // Итого
        const totalRow = sheet.getRow(currentRow);
        totalRow.font = { bold: true };
        changeRowColor(totalRow, darkBlueColor);
        totalRow.getCell(2).value = 'ИТОГО:';
        totalRow.getCell(2).font = {
            bold: true,
            color: { argb: `FF${whiteColor}` }
        };
        totalRow.getCell(6).value = {
            formula: `SUM(F9:F${currentRow - 1})`,
            result: totalSum
        };
        totalRow.getCell(6).font = {
            bold: true,
            color: { argb: `FF${whiteColor}` }
        };
        totalRow.commit();
        setBorderRange(sheet, 9, currentRow);
        // === Примечание ===
        currentRow += 2;
        const dopsCell = sheet.getRow(currentRow).getCell(2);
        dopsCell.value =
            'Все дополнительные работы оговариваются с заказчиком и вносятся в смету.';
        dopsCell.font = { bold: true };
        currentRow += 2;
        const agreeCell = sheet.getRow(currentRow).getCell(2);
        agreeCell.value =
            'Ознакомлен и согласен _______________________________________________';
        sheet.eachRow((row, num) => {
            if (num <= 8)
                return;
            row.eachCell(cell => (cell.font = { ...cell.font, size: 12 }));
        });
        sheet.pageSetup.printArea = `A1:F${currentRow}`;
        sheet.pageSetup.fitToPage = true;
        sheet.pageSetup.fitToWidth = 1;
        sheet.pageSetup.fitToHeight = 0;
        sheet.pageSetup.orientation = 'portrait';
        sheet.pageSetup.paperSize = 9; // A4
        // Отдаём файл
        const safeName = (0, slugify_1.default)(object, {
            lower: true,
            strict: true,
            replacement: '_'
        }).substring(0, 40);
        const filename = `smeta_${safeName || 'document'}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        await workbook.xlsx.write(res);
        res.end();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// ========== Парсинг сметы ==========
app.post('/api/upload-smeta', upload.single('excel_file'), async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res
                .status(400)
                .json({ error: 'Файл не загружен', param: req.file || 'нет' });
        }
        const fileBuffer = Buffer.from(req.file.buffer);
        const workbook = new exceljs_1.default.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const sheet = workbook.worksheets[0];
        if (!sheet) {
            return res.status(400).json({ error: 'В файле нет листов' });
        }
        let places = {};
        let isEnd = false;
        let transportCost = undefined;
        let trashCost = undefined;
        const getNumValue = (cell) => {
            const val = cell.value;
            if (val && typeof val === 'object' && 'result' in val) {
                return Number(val.result) || 0;
            }
            return Number(val) || 0;
        };
        sheet.eachRow((row, num) => {
            if (num < 9 || isEnd)
                return;
            const col1 = row.getCell(1).toString().trim();
            const col2 = row.getCell(2).toString().trim();
            if (col2.includes('ИТОГО:')) {
                isEnd = true;
                return;
            }
            if (col2.includes('ТРАНСПОРТНЫЕ РАСХОДЫ')) {
                isEnd = true;
                transportCost = getNumValue(row.getCell(5));
                return;
            }
            if (col2.includes('ВЫНОС И УБОРКА МУСОРА')) {
                isEnd = true;
                trashCost = getNumValue(row.getCell(5));
                return;
            }
            if (col1.length === 0) {
                if (col2) {
                    // Создаем место, только если имя не пустое
                    places[col2] = [];
                }
            }
            else {
                const keys = Object.keys(places);
                const lastPlace = keys[keys.length - 1];
                if (!lastPlace)
                    return;
                places[lastPlace].push({
                    name: col2,
                    price: getNumValue(row.getCell(5)),
                    quantity: getNumValue(row.getCell(4)),
                    unit: row.getCell(3).toString()
                });
            }
        });
        const c4Cell = sheet.getCell('C4');
        const objectName = c4Cell.value &&
            typeof c4Cell.value === 'object' &&
            'result' in c4Cell.value
            ? c4Cell.value.result
            : c4Cell.value;
        res.json({
            success: true,
            data: {
                object: objectName?.toString() || null,
                places,
                transportCost,
                trashCost
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// ========== Запуск ==========
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
