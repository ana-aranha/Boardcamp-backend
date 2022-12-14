import connection from "../database/database.js";

function getCategories(req, res) {
	connection.query("SELECT * FROM categories;").then((categories) => {
		res.send(categories.rows);
	});
}

async function createCategories(req, res) {
	const name = req.body.name.trim();

	if (!name) {
		return res.sendStatus(400);
	}

	try {
		const category = await connection.query(
			"SELECT * FROM categories WHERE name ILIKE $1;",
			[name],
		);
		if (category.rows[0]) {
			return res.sendStatus(409);
		}
		connection.query(`INSERT INTO categories (name) VALUES ($1);`, [name]);
		res.sendStatus(201);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
}

export { getCategories, createCategories };
