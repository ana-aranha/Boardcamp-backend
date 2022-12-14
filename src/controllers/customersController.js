import connection from "../database/database.js";
import customerSchema from "../schemas/customerSchema.js";

async function creatCustomer(req, res) {
	const custumer = req.body;

	const validation = customerSchema.validate(custumer);

	try {
		if (validation.error) {
			return res.status(400).send({ message: validation.error.message });
		}

		const invalidCpf = await connection.query(
			"SELECT * FROM customers WHERE cpf LIKE $1;",
			[`${custumer.cpf}`],
		);

		if (invalidCpf.rows[0]) {
			return res.sendStatus(409);
		}

		await connection.query(
			"INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1,$2,$3, $4);",
			[custumer.name.trim(), custumer.phone, custumer.cpf, custumer.birthday],
		);

		res.sendStatus(201);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
}

async function getCustomers(req, res) {
	const cpfFilter = req.query.cpf;

	try {
		if (cpfFilter) {
			const customersFiltered = await connection.query(
				"SELECT * FROM customers WHERE cpf ILIKE $1;",
				[`${cpfFilter}%`],
			);
			return res.send(customersFiltered.rows);
		}

		connection
			.query("SELECT * FROM customers;")
			.then((customers) => res.send(customers.rows));
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
}

async function updateCustomer(req, res) {
	const clientID = req.params.id;
	const changes = req.body;
	const validation = customerSchema.validate(changes);

	try {
		if (validation.error) {
			return res.status(400).send({ message: validation.error.message });
		}

		const customersFiltered = await connection.query(
			"SELECT * FROM customers WHERE id = $1;",
			[clientID],
		);

		if (!customersFiltered.rows[0]) {
			return res.sendStatus(404);
		}

		const invalidCpf = await connection.query(
			"SELECT * FROM customers WHERE cpf = $1;",
			[changes.cpf],
		);

		if (
			invalidCpf.rows[0] &&
			invalidCpf.rows[0].cpf != customersFiltered.rows[0].cpf
		) {
			return res.sendStatus(409);
		}

		await connection.query(
			"UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;",
			[changes.name, changes.phone, changes.cpf, changes.birthday, clientID],
		);

		res.sendStatus(200);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
}

async function getCustomerById(req, res) {
	const clientID = req.params.id;

	try {
		const customersFiltered = await connection.query(
			"SELECT * FROM customers WHERE id = $1;",
			[clientID],
		);

		if (!customersFiltered.rows[0]) {
			return res.sendStatus(404);
		}

		res.send(customersFiltered.rows[0]);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
}

export { creatCustomer, getCustomerById, updateCustomer, getCustomers };
