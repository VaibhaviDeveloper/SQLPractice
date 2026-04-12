import 'reflect-metadata';
import 'dotenv/config';
import { db } from './db.js';
import { User } from './src/entities/user.entity.js';
import { Employee } from './src/entities/employee.entity.js';

function log(section: string) {
    console.log(`\n${'─'.repeat(40)}`);
    console.log(`  ${section}`);
    console.log('─'.repeat(40));
}

async function main() {

    // ── CREATE ──────────────────────────────────
    log('CREATE');

    const user1 = new User({
        id: 0,
        name: 'John Doe',
        address: '123 Main St',
        dob: new Date('1990-01-01'),
        email: 'john@example.com',
        createdAt: new Date(),
        createdBy: 1,
        updatedAt: new Date(),
        updatedBy: 1,
    });
    await user1.save();
    console.log('✅ user1 saved');

    const user2 = new User({
        id: 0,
        name: 'Jane Smith',
        address: '456 Oak Ave',
        dob: new Date('1995-06-15'),
        email: 'jane@example.com',
        createdAt: new Date(),
        createdBy: 1,
        updatedAt: new Date(),
        updatedBy: 1,
    });
    await user2.save();
    console.log('✅ user2 saved');

    const user3 = new User({
        id: 0,
        name: 'Bob Wilson',
        address: '789 Pine Rd',
        dob: new Date('1988-03-22'),
        email: 'bob@example.com',
        createdAt: new Date(),
        createdBy: 1,
        updatedAt: new Date(),
        updatedBy: 1,
    });
    await user3.save();
    console.log('✅ user3 saved');

    const emp1 = new Employee({
        id: 0,
        name: 'Alice Johnson',
        position: 'Software Engineer',
        department: 'Engineering',
        salary: 90000,
        createdAt: new Date(),
        createdBy: 1,
        updatedAt: new Date(),
        updatedBy: 1,
    });
    await emp1.save();
    console.log('✅ emp1 saved');

    const emp2 = new Employee({
        id: 0,
        name: 'Charlie Brown',
        position: 'Product Manager',
        department: 'Product',
        salary: 95000,
        createdAt: new Date(),
        createdBy: 1,
        updatedAt: new Date(),
        updatedBy: 1,
    });
    await emp2.save();
    console.log('✅ emp2 saved');

    // ── FIND BY ID ───────────────────────────────
    log('FIND BY ID');

    const foundUser = await User.findById(1);
    console.log('User with id=1:', foundUser);

    const foundEmp = await Employee.findById(1);
    console.log('Employee with id=1:', foundEmp);

    // null case
    const notFound = await User.findById(9999);
    console.log('User with id=9999 (should be null):', notFound);

    // ── FIND ONE (by condition) ──────────────────
    log('FIND ONE');

    const byEmail = await User.findOne({ email: 'jane@example.com' });
    console.log('User by email:', byEmail);

    const byDept = await Employee.findOne({ department: 'Engineering' });
    console.log('Employee by department:', byDept);

    const byNameAndDept = await Employee.findOne({
        name: 'Charlie Brown',
        department: 'Product',
    });
    console.log('Employee by name + department:', byNameAndDept);

    // ── FIND ALL ─────────────────────────────────
    log('FIND ALL');

    const allUsers = await User.findAll();
    console.log(`All users (${allUsers.length}):`);
    allUsers.forEach(u => console.log(`  → ${u.name} | ${u.email}`));

    const allEmployees = await Employee.findAll();
    console.log(`All employees (${allEmployees.length}):`);
    allEmployees.forEach(e => console.log(`  → ${e.name} | ${e.position} | $${e.salary}`));

    // ── UPDATE (save on existing id) ─────────────
    log('UPDATE');

    const toUpdate = await User.findById(1);
    if (toUpdate) {
        toUpdate.address = '999 Updated Blvd';
        toUpdate.updatedAt = new Date();
        toUpdate.updatedBy = 2;
        await toUpdate.save(); // triggers ON DUPLICATE KEY UPDATE
        console.log('✅ user1 address updated');

        const verified = await User.findById(1);
        console.log('Updated address:', verified?.address);
    }

    const empToUpdate = await Employee.findById(1);
    if (empToUpdate) {
        empToUpdate.salary = 105000;
        empToUpdate.position = 'Senior Software Engineer';
        empToUpdate.updatedAt = new Date();
        await empToUpdate.save();
        console.log('✅ emp1 salary + position updated');

        const verified = await Employee.findById(1);
        console.log('Updated salary:', verified?.salary);
        console.log('Updated position:', verified?.position);
    }

    // ── DELETE BY ID ─────────────────────────────
    log('DELETE BY ID');

    await User.deleteById(3); // deletes bob
    console.log('✅ user3 (Bob) deleted');

    const deletedCheck = await User.findById(3);
    console.log('Bob after delete (should be null):', deletedCheck);

    // ── DELETE ONE (by condition) ─────────────────
    log('DELETE ONE');

    await Employee.deleteOne({ department: 'Product' });
    console.log('✅ First employee in Product dept deleted');

    const remainingEmps = await Employee.findAll();
    console.log(`Employees remaining (${remainingEmps.length}):`);
    remainingEmps.forEach(e => console.log(`  → ${e.name}`));

    // ── DELETE ALL ───────────────────────────────
    log('DELETE ALL');

    await User.deleteAll();
    console.log('✅ All users deleted');

    await Employee.deleteAll();
    console.log('✅ All employees deleted');

    const usersAfterWipe = await User.findAll();
    const empsAfterWipe = await Employee.findAll();
    console.log('Users remaining:', usersAfterWipe.length);   // 0
    console.log('Employees remaining:', empsAfterWipe.length); // 0

    await db.end();
    console.log('\n✅ Done. Connection closed.');
}

main().catch(console.error);