const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/enviar', (req, res) => {
    const { nome, sentindo_bem, bebida, sono, apto } = req.body;

    const doc = new PDFDocument();
    const filePath = `./checklist_${Date.now()}.pdf`;
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(16).text('Checklist de Aptidão Diária', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Colaborador: ${nome}`);
    doc.text(`Está se sentindo bem? ${sentindo_bem}`);
    doc.text(`Ingeriu bebida alcoólica? ${bebida}`);
    doc.text(`Sinais de sonolência? ${sono}`);
    doc.text(`Apto para o trabalho? ${apto}`);
    doc.end();

    stream.on('finish', () => {
        const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'augustomarcos026@gmail.com',
            subject: 'Checklist de Aptidão - PDF',
            text: `Segue checklist de ${nome}`,
         attachments: [{ filename: path.basename(filePath), path: filePath }]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            fs.unlinkSync(filePath);
            if (error) return res.send('Erro ao enviar e-mail.');
            res.send('Checklist enviado com sucesso!');
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
